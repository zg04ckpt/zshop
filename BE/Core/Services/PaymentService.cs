using Core.Configurations;
using Core.DTOs.Common;
using Core.DTOs.Order;
using Core.DTOs.User;
using Core.DTOs.Vouchers;
using Core.Entities.BookFeature;
using Core.Entities.PaymentFeature;
using Core.Entities.VoucherFeature;
using Core.Enums;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Utilities;
using LinqKit;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Security.Claims;

namespace Core.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStorageService _storageService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        private readonly VNPayConfig _vnPayConfig;
        private readonly PaymentConfig _paymentConfig;

        public PaymentService(
            IOptions<VNPayConfig> vnPayConfigInstance,
            IOptions<PaymentConfig> paymentConfigInstance,
            IStorageService storageService,
            IHttpContextAccessor httpContextAccessor,
            IUnitOfWork unitOfWork)
        {
            _vnPayConfig = vnPayConfigInstance.Value;
            _paymentConfig = paymentConfigInstance.Value;
            _storageService = storageService;
            _httpContextAccessor = httpContextAccessor;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResult<string>> CreateOrderFromBook(string bookId, ClaimsPrincipal claims)
        {
            // Get price of books
            var book = await _unitOfWork.Repository<Book>()
                .GetFirstAsync(e => e.Id.ToString() == bookId)
                ?? throw new BadRequestException("Không tìm thấy sách.");

            var now = DateTime.UtcNow;

            // Create order and detail, default has only 1 book
            var order = new Order
            {
                Id = "ORDER" + now.ToString("ddMMyyHHmmss"),
                Currency = "VND",
                CustomerId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!),
                OrderDate = now,
                UpdatedAt = now,
                PaymentStatus = PayStatus.Unpaid,
                OrderStatus = OrderStatus.Created,
                PaymentMethod = PaymentMethod.CashOnDelivery,
                TotalAmount = book.Price,
                
                AddressId = await _unitOfWork.Users.GetDefaultAddress(Guid.Parse(Helper.GetUserIdFromClaims(claims)!))
            };
            order.OrderDetails = new List<OrderDetail> {
                new() {
                    BookId = book.Id,
                    BookName = book.Name,
                    Price = book.Price,
                    Quantity = 1,
                }
            };

            await _unitOfWork.Repository<Order>().AddAsync(order);
            await _unitOfWork.SaveChangesAsync();

            // return order id
            return new ApiSuccessResult<string>(order.Id);
        }

        public async Task<ApiResult<OrderDTO>> GetUnConfirmedOrder(string orderId, ClaimsPrincipal claims)
        {
            // Check valid order
            var order = await _unitOfWork.Repository<Order>().GetFirstAsync(e => e.Id == orderId)
                ?? throw new BadRequestException("Đơn hàng không tồn tại.");
            if (order.OrderStatus != OrderStatus.Created)
                throw new BadRequestException($"Đơn hàng đã được xác nhận, vui lòng truy cập lịch sử đơn hàng để xem thông tin.");

            // Check valid customer
            if (order.CustomerId.ToString() != Helper.GetUserIdFromClaims(claims))
                throw new ForbbidenException();

            var detail = await _unitOfWork.Repository<OrderDetail>()
                .GetAllAsync(e => e.OrderId == orderId);

            return new ApiSuccessResult<OrderDTO>(new OrderDTO
            {
                Id = orderId,
                Items = detail.Select(e => new OrderItemDTO
                {
                    BookId = e.BookId,
                    Title = e.BookName,
                    Price = e.Price,
                    Quantity = e.Quantity
                }).ToArray(),
                AddressId = order.AddressId,
                PaymentMethod = order.PaymentMethod,
            });
        }

        public async Task<ApiResult<string>> Pay(string orderId, OrderDTO data, ClaimsPrincipal claims, string? ip)
        {
            // Get order info
            var order = await _unitOfWork.Repository<Order>().GetFirstAsync(
                predicate: e => e.Id == orderId,
                includes: e => e.OrderDetails)
                ?? throw new BadRequestException("Đơn hàng không tồn tại.");

            // Check valid
            if (data.AddressId == null)
            {
                throw new BadRequestException("Vui lòng thiết lập địa chỉ.");
            }
            if (order.CustomerId.ToString() != Helper.GetUserIdFromClaims(claims))
            {
                throw new ForbbidenException();
            }
            if (order.OrderStatus != OrderStatus.Created)
            {
                throw new BadRequestException("Đơn hàng đã hủy hoặc đã được gửi đi, vui lòng kiểm tra lịch sử thanh toán để biết thêm chi tiết.");
            }
            if (order.PaymentStatus == PayStatus.Paid)
            {
                throw new BadRequestException("Đơn hàng đã được thanh toán, vui lòng kiểm tra lịch sử thanh toán để biết thêm chi tiết.");
            }

            // Update order info (in case user change number of item)
            var itemCountMap = data.Items.ToDictionary(e => e.BookId);
            order.TotalAmount = 0;
            order.OrderDetails.ForEach(e =>
            {
                if (itemCountMap.TryGetValue(e.BookId, out var item))
                {
                    e.Quantity = item.Quantity;
                    order.TotalAmount += e.Price * e.Quantity;
                }
                else
                {
                    throw new BadRequestException("Thông tin đơn hàng không hợp lệ.");
                }
            });

            // Handle discount by voucher
            if (!string.IsNullOrEmpty(data.VoucherId))
            {
                var voucher = await _unitOfWork.Repository<Voucher>().GetFirstAsync(e => e.Id == data.VoucherId)
                    ?? throw new BadRequestException("Voucher giảm giá không tồn tại.");

                if (voucher.AppliedOrders.Count == voucher.Quantity ||
                    voucher.ValidUntil <= DateTime.UtcNow)
                    throw new BadRequestException("Voucher giảm giá đã hết hạn hoặc đã được sử dụng hết.");

                order.VoucherId = voucher.Id;
                if (voucher.DiscountType == DiscountType.Amount)
                {
                    order.TotalDiscount = voucher.Discount;
                }
                else if (voucher.DiscountType == DiscountType.Percentage)
                {
                    order.TotalDiscount = Math.Floor(voucher.Discount / 100 * order.TotalAmount);
                    if (order.TotalDiscount > voucher.MaxDiscount)
                    {
                        order.TotalDiscount = voucher.MaxDiscount;
                    }
                }
            }
            if (order.TotalDiscount > order.TotalAmount)
            {
                order.TotalDiscount = order.TotalAmount;
            }
            order.TotalAmount -= order.TotalDiscount;

            // Order info
            order.PaymentMethod = data.PaymentMethod;
            order.OrderStatus = OrderStatus.Placed;
            order.TotalAmount = Math.Round(order.TotalAmount, 0, MidpointRounding.AwayFromZero);
            order.AddressId = data.AddressId;
            order.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Repository<Order>().UpdateAsync(order);

            if (data.PaymentMethod == PaymentMethod.VNPay)
            {
                var payUrl = await HandleVNPay(order, ip!);
                await _unitOfWork.SaveChangesAsync();
                return new ApiSuccessResult<string>(payUrl); 
            }

            if (data.PaymentMethod == PaymentMethod.CashOnDelivery)
            {
                var request = _httpContextAccessor.HttpContext!.Request;
                await _unitOfWork.SaveChangesAsync();
                return new ApiSuccessResult<string>(
                    $"{request.Scheme}://{request.Host}/payment/order-success?orderId=" + orderId);
            }

            throw new InternalServerErrorException("Lỗi khi xử lý thanh toán!");
        }

        private async Task<string> HandleVNPay(Order order, string ip)
        {
            var nowUtc = DateTime.UtcNow;
            var now = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, TimeZoneInfo.FindSystemTimeZoneById("Asia/Bangkok"));

            // Create a transaction
            var transaction = new Transaction
            {
                Id = "TRA" + now.ToString("yyyyMMddHHmmss"),
                Amount = order.TotalAmount,
                CreatedAt = nowUtc,
                OrderId = order.Id,
                Status = TransactionStatus.Processing,
            };
            await _unitOfWork.Repository<Transaction>().AddAsync(transaction);
            await _unitOfWork.SaveChangesAsync();

            // Create payment url for customer
            var vnpay = new VNPayLib();
            vnpay.AddRequestData("vnp_Version", _vnPayConfig.vnp_Version);
            vnpay.AddRequestData("vnp_Command", _vnPayConfig.vnp_Command);
            vnpay.AddRequestData("vnp_TmnCode", _vnPayConfig.vnp_TmnCode);
            vnpay.AddRequestData("vnp_Amount", (transaction.Amount * 100).ToString());
            vnpay.AddRequestData("vnp_CreateDate", transaction.CreatedAt.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", order.Currency);
            vnpay.AddRequestData("vnp_IpAddr", ip);
            vnpay.AddRequestData("vnp_Locale", _vnPayConfig.vnp_Locale);
            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan don hang: {transaction.OrderId}");
            vnpay.AddRequestData("vnp_OrderType", _vnPayConfig.vnp_OrderType);
            vnpay.AddRequestData("vnp_ReturnUrl", _vnPayConfig.vnp_ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", transaction.Id);
            vnpay.AddRequestData("vnp_ExpireDate", now.AddMinutes(_paymentConfig.ExpireInMinutes).ToString("yyyyMMddHHmmss"));

            string paymentUrl = vnpay.CreateRequestUrl(_vnPayConfig.vnp_Url, EnvHelper.GetVNpayHashSecret());
            return paymentUrl;
        }

        public async Task<string> GetCashOnDeliveryOrderSuccess(string orderId)
        {
            // Get order info
            var order = await _unitOfWork.Repository<Order>().GetFirstAsync(e => e.Id == orderId)
                ?? throw new BadRequestException("Đơn hàng không tồn tại.");

            if (order.PaymentMethod == PaymentMethod.CashOnDelivery &&
                order.OrderStatus != OrderStatus.Created)
            {
                string page = await _storageService.GetHtmlTemplate("order_success_page.html");
                page = page.Replace("[orderStatus]", order.OrderStatus.ToString());
                page = page.Replace("[orderId]", orderId);
                page = page.Replace("[clientHomePageUrl]", _paymentConfig.ClientHomeUrl);
                return page;
            }
            throw new BadRequestException("Đơn hàng không hợp lệ.");
        }

        public async Task<string> GetVNPayTransactionResult(Dictionary<string, string> data)
        {
            try
            {
                var vnpayLib = new VNPayLib();
                foreach (var kvp in data)
                {
                    if (!string.IsNullOrEmpty(kvp.Key) && kvp.Key.StartsWith("vnp_"))
                    {
                        vnpayLib.AddResponseData(kvp.Key, kvp.Value);
                    }
                }

                // Get result
                string transactionId = vnpayLib.GetResponseData("vnp_TxnRef");
                long amount = Convert.ToInt64(vnpayLib.GetResponseData("vnp_Amount")) / 100;
                string vnp_ResponseCode = vnpayLib.GetResponseData("vnp_ResponseCode");
                string vnp_TransactionStatus = vnpayLib.GetResponseData("vnp_TransactionStatus");
                string vnp_OrderInfo = vnpayLib.GetResponseData("vnp_OrderInfo");
                string vnp_SecureHash = vnpayLib.GetResponseData("vnp_SecureHash");

                // Get transaction in system
                string errorMessage = null;
                var transaction = await _unitOfWork.Repository<Transaction>().GetFirstAsync(
                    predicate: e => e.Id == transactionId,
                    includes: e => e.Order)
                    ?? throw new InternalServerErrorException("Giao dịch không tồn tại.");

                // Update amount with real paid amount
                transaction.Amount = amount;

                // Check valid
                if (!vnpayLib.ValidateSignature(vnp_SecureHash, EnvHelper.GetVNpayHashSecret()))
                {
                    errorMessage = "Chữ kí không hợp lệ.";
                    transaction.Status = TransactionStatus.Failure;
                    transaction.Note = $"Chữ kí không hợp lệ (Nội dung thanh toán: {vnp_OrderInfo})";
                }
                else if (transaction.Order.TotalAmount != transaction.Amount)
                {
                    errorMessage = "Số tiền thanh toán không hợp lệ.";
                    transaction.Status = TransactionStatus.Failure;
                    transaction.Note = $"Số tiền thanh toán không hợp lệ (Nội dung thanh toán: {vnp_OrderInfo})";
                }
                // Check if success
                else if (vnp_ResponseCode == "00" && vnp_TransactionStatus == "00")
                {
                    transaction.Status = TransactionStatus.Success;
                }
                else
                {
                    errorMessage = "Lỗi không xác định.";
                    transaction.Status = TransactionStatus.Failure;
                    transaction.Note = $"Lỗi không xác định (Nội dung thanh toán: {vnp_OrderInfo})";
                }

                // return result by static page
                if (transaction.Status == TransactionStatus.Success)
                {
                    // Update order status
                    transaction.Order.OrderStatus = OrderStatus.Placed;
                    transaction.Order.PaymentStatus = PayStatus.Paid;
                    transaction.Order.UpdatedAt = DateTime.UtcNow;

                    await _unitOfWork.Repository<Order>().UpdateAsync(transaction.Order);
                    await _unitOfWork.Repository<Transaction>().UpdateAsync(transaction);
                    await _unitOfWork.SaveChangesAsync();

                    string page = await _storageService.GetHtmlTemplate("payment_success_page.html");
                    page = page.Replace("[amount]", transaction.Amount.ToString("N0", CultureInfo.InvariantCulture));
                    page = page.Replace("[currency]", transaction.Order.Currency);
                    page = page.Replace("[orderId]", transaction.Order.Id);
                    page = page.Replace("[clientHomePageUrl]", _paymentConfig.ClientHomeUrl);
                    return page;
                }
                else
                {
                    // Update order status
                    transaction.Order.PaymentStatus = PayStatus.Failed;
                    transaction.Order.UpdatedAt = DateTime.UtcNow;

                    await _unitOfWork.Repository<Order>().UpdateAsync(transaction.Order);
                    await _unitOfWork.Repository<Transaction>().UpdateAsync(transaction);
                    await _unitOfWork.SaveChangesAsync();

                    string page = await _storageService.GetHtmlTemplate("payment_failure_page.html");
                    page = page.Replace("[mess]", errorMessage);
                    page = page.Replace("[orderId]", transaction.Order.Id);
                    page = page.Replace("[clientHomePageUrl]", _paymentConfig.ClientHomeUrl);
                    return page;
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                string page = await _storageService.GetHtmlTemplate("payment_failure_page.html");
                page = page.Replace("[mess]", "Lỗi xử lý kết quả");
                page = page.Replace("[orderId]", "--");
                page = page.Replace("[clientHomePageUrl]", _paymentConfig.ClientHomeUrl);
                return page;
            }
        }

        public async Task<string> UpdateVNPayTransactionStatus(Dictionary<string, string> data)
        {
            var vnpayLib = new VNPayLib();
            foreach (var kvp in data)
            {
                if (!string.IsNullOrEmpty(kvp.Key) && kvp.Key.StartsWith("vnp_"))
                {
                    vnpayLib.AddResponseData(kvp.Key, kvp.Value);
                }
            }

            // Get result
            string transactionId = vnpayLib.GetResponseData("vnp_TxnRef");
            long amount = Convert.ToInt64(vnpayLib.GetResponseData("vnp_Amount")) / 100;
            string vnp_ResponseCode = vnpayLib.GetResponseData("vnp_ResponseCode");
            string vnp_TransactionStatus = vnpayLib.GetResponseData("vnp_TransactionStatus");
            string vnp_OrderInfo = vnpayLib.GetResponseData("vnp_OrderInfo");
            string vnp_SecureHash = vnpayLib.GetResponseData("vnp_SecureHash");

            // Get transaction in system
            string returnMessage = null;
            var transaction = await _unitOfWork.Repository<Transaction>().GetFirstAsync(
                predicate: e => e.Id == transactionId,
                includes: e => e.Order)
                ?? throw new InternalServerErrorException("Giao dịch không tồn tại.");

            // Update amount with real paid amount
            transaction.Amount = amount;

            // Check valid
            if (!vnpayLib.ValidateSignature(vnp_SecureHash, EnvHelper.GetVNpayHashSecret()))
            {
                returnMessage = "{\"RspCode\":\"97\",\"Message\":\"Invalid signature\"}";
                transaction.Status = TransactionStatus.Failure;
                transaction.Order.PaymentStatus = PayStatus.Failed;
                transaction.Note = $"Chữ kí không hợp lệ (Nội dung thanh toán: {vnp_OrderInfo})";
            }
            else if (transaction.Order.TotalAmount != transaction.Amount)
            {
                returnMessage = "{\"RspCode\":\"04\",\"Message\":\"invalid amount\"}";
                transaction.Status = TransactionStatus.Failure;
                transaction.Order.PaymentStatus = PayStatus.Failed;
                transaction.Note = $"Số tiền thanh toán không hợp lệ (Nội dung thanh toán: {vnp_OrderInfo})";
            }
            else if (vnp_ResponseCode == "00" && vnp_TransactionStatus == "00")
            {
                transaction.Status = TransactionStatus.Success;
                transaction.Order.PaymentStatus = PayStatus.Paid;
                transaction.Order.OrderStatus = OrderStatus.Placed;
                returnMessage = "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";
            }
            else
            {
                returnMessage = "{\"RspCode\":\"99\",\"Message\":\"unknown error\"}";
                transaction.Status = TransactionStatus.Failure;
                transaction.Order.PaymentStatus = PayStatus.Failed;
                transaction.Note = $"Lỗi không xác định (Nội dung thanh toán: {vnp_OrderInfo})";
            }

            transaction.Order.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Order>().UpdateAsync(transaction.Order);
            await _unitOfWork.Repository<Transaction>().UpdateAsync(transaction);
            await _unitOfWork.SaveChangesAsync();

            return returnMessage;
        }

        public async Task<ApiResult<Paginated<OrderHistoryListItemDTO>>>GetOrderHistory(OrderHistorySearchDTO data, ClaimsPrincipal claims)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var orders = await _unitOfWork.Repository<Order>().GetPagingAsync(
                predicate: e => e.CustomerId == userId,
                pageIndex: data.PageIndex,
                pageSize: data.PageSize,
                selector: e => new OrderHistoryListItemDTO
                {
                    Id = e.Id,
                    Currency = e.Currency,
                    UpdatedAt = e.UpdatedAt,
                    OrderDate = e.OrderDate,
                    OrderStatus = e.OrderStatus,
                    PaymentStatus = e.PaymentStatus,
                    TotalAmount = e.TotalAmount,
                    PaymentMethod = e.PaymentMethod
                },
                orderBy: e => e.UpdatedAt,
                asc: false);
            return new ApiSuccessResult<Paginated<OrderHistoryListItemDTO>>(orders);
        }

        public async Task<ApiResult<OrderHistoryDetailDTO>> GetOrderHistoryDetail(string orderId, ClaimsPrincipal claims)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var filter = PredicateBuilder.New<Order>(true);

            if (Helper.CheckRoleFromClaims("Admin", claims))
            {
                filter.And(e => e.Id == orderId);
            }
            else
            {
                filter.And(e => e.Id == orderId && e.CustomerId == userId);
            }    

            var data = await _unitOfWork.Repository<Order>().GetFirstAsync(
                predicate: filter,
                selector: e => new OrderHistoryDetailDTO
                {
                    Id = e.Id,
                    UserId = e.CustomerId.ToString(),
                    OrderDate = e.OrderDate,
                    UpdatedAt = e.UpdatedAt,
                    Currency = e.Currency,
                    TotalAmount = e.TotalAmount,
                    TotalDiscount = e.TotalDiscount,
                    OrderStatus = e.OrderStatus,
                    PaymentStatus = e.PaymentStatus,
                    PaymentMethod = e.PaymentMethod,
                    Items = e.OrderDetails.Select(od => new OrderItemDTO
                    {
                        BookId = od.BookId,
                        Price = od.Price,
                        Quantity = od.Quantity,
                        Title = od.Book.Name
                    }).ToArray(),
                    Address = e.Address != null ? new AddressItemDTO
                    {
                        City = e.Address.City,
                        Detail = e.Address.Detail,
                        District = e.Address.District,
                        PhoneNumber = e.Address.PhoneNumber,
                        Ward = e.Address.Ward,
                        ReceiverName = e.Address.ReceiverName,
                        Id = e.AddressId.ToString()!
                    } : null,
                    Voucher = e.Voucher != null ? new VoucherDetailDTO
                    {
                        Id = e.Voucher.Id,
                        Code = e.Voucher.Code,
                        Discount = e.Voucher.Discount,
                        DiscountType = e.Voucher.DiscountType,
                        IsActive = e.Voucher.IsActive,
                        MaxDiscount = e.Voucher.MaxDiscount,
                        Name = e.Voucher.Name,
                        Quantity = e.Voucher.Quantity,
                        RemainingQuantity = e.Voucher.Quantity - e.Voucher.AppliedOrders.Count,
                        ValidUntil = e.Voucher.ValidUntil,
                        ValidFrom = e.Voucher.ValidFrom,
                        Status = Helper.GetStatusFromTimeLine(e.Voucher.ValidFrom, e.Voucher.ValidUntil)
                    } : null,
                    Transactions = e.Transactions.Select(t => new TransactionDetailDTO
                    {
                        Id = t.Id,
                        Amount = t.Amount,
                        CreatedAt = t.CreatedAt,
                        Note = t.Note,
                        OrderId = t.OrderId,
                        Status = t.Status
                    }).ToArray()
                })
                ?? throw new BadRequestException("Đơn hàng không hợp lệ.");

            return new ApiSuccessResult<OrderHistoryDetailDTO>(data);
        }

        public async Task<ApiResult> CancelOrder(string orderId, CancelOrderRequestDTO data, ClaimsPrincipal claims)
        {
            var cancelOrderRepo = _unitOfWork.Repository<CancelOrderRequest>();

            // Check valid user and valid order
            var order = await _unitOfWork.Repository<Order>().GetFirstAsync(e => e.Id == orderId);
            if (order is null || order.OrderStatus == OrderStatus.Cancelled)
                throw new BadRequestException("Đơn hàng đã bị hủy hoặc không tồn tại.");
            if (order.CustomerId.ToString() != Helper.GetUserIdFromClaims(claims))
                throw new ForbbidenException();

            // User cannot request more than one time.
            if (await cancelOrderRepo.ExistsAsync(e => e.OrderId == orderId))
            {
                throw new BadRequestException("Yêu cầu đã được gửi đi trước đó, vui lòng đợi người bán xác nhận.");
            }

            // Only orders with following status can be cancelled: Created, Placed, Accepted, InProgress
            if (order.OrderStatus == OrderStatus.Shipping ||
                order.OrderStatus == OrderStatus.Delivered)
            {
                throw new BadRequestException("Đơn hàng không thể hủy do đang được vận chuyển hoặc đã được giao.");
            }

            // Accepted and InProgress status must be allowed by shop owner (admin) before cancelling
            if (order.OrderStatus == OrderStatus.Accepted ||
                order.OrderStatus == OrderStatus.InProgress)
            {
                await cancelOrderRepo.AddAsync(new CancelOrderRequest()
                {
                    OrderId = order.Id,
                    Reason = data.Reason,
                    CreatedAt = DateTime.UtcNow,
                });
                await _unitOfWork.SaveChangesAsync();

                return new ApiSuccessResult("Đang gửi yêu cầu hủy đơn hàng, vui lòng đợi người bán chấp nhận.");
            }

            // Remaining statuses can be cancelled immediately
            order.OrderStatus = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Repository<Order>().UpdateAsync(order);
            await _unitOfWork.SaveChangesAsync();

            // If order was paid, refund in 24h
            if (order.PaymentStatus == PayStatus.Paid)
            {
                // Send notification
                return new ApiSuccessResult("Hủy đơn hàng thành công. Hệ thống sẽ hoàn tiền trong vòng 24h kể từ thời điểm hủy đơn hàng.");
            }

            return new ApiSuccessResult("Hủy đơn hàng thành công.");
        }

        public async Task<ApiResult> AcceptOrRejectOrderCancelling(int requestId, bool isAccepted)
        {
            var cancelOrderRepo = _unitOfWork.Repository<CancelOrderRequest>();

            var request = await cancelOrderRepo.GetFirstAsync(
                predicate: e => e.Id == requestId,
                includes: e => e.Order)
                ?? throw new BadRequestException("Yêu cầu hủy không tồn tại.");

            if (isAccepted)
            {
                request.Order.OrderStatus = OrderStatus.Cancelled;
                await _unitOfWork.Repository<Order>().UpdateAsync(request.Order);
            }

            // remove request
            await cancelOrderRepo.DeleteAsync(request);
            await _unitOfWork.SaveChangesAsync();

            if (isAccepted)
            {
                return new ApiSuccessResult($"Đã hủy đơn hànng {request.OrderId}"); 
            }
            else
            {
                return new ApiSuccessResult($"Đã từ chối hủy đơn hànng {request.OrderId}");
            }
        }

        public async Task<ApiResult<Paginated<CancelOrderRequestListItemDTO>>> GetAllCancelOrderRequest(int page)
        {
            var cancelRequests = await _unitOfWork.Repository<CancelOrderRequest>().GetPagingAsync(
                predicate: e => true,
                pageIndex: page,
                pageSize: 100,
                orderBy: e => e.CreatedAt,
                asc: false,
                selector: e => new CancelOrderRequestListItemDTO
                {
                    Id = e.Id,
                    Reason = e.Reason,
                    Amount = e.Order.TotalAmount,
                    Currency = e.Order.Currency,
                    CreatedAt = e.CreatedAt,
                    OrderId = e.OrderId
                });
                
            return new ApiSuccessResult<Paginated<CancelOrderRequestListItemDTO>>(cancelRequests);
        }

        public async Task<ApiResult<SystemOrdersDTO>> GetAllSystemOrder(SystemOrderSearchDTO data)
        {
            var filter = PredicateBuilder.New<Order>(true);

            // Filter by status
            if (data.Status != null)
                filter.And(e => e.OrderStatus == data.Status);

            // Filter by date range
            filter.And(e => 
                e.UpdatedAt >= data.StartDate &&  
                e.UpdatedAt <= data.EndDate);

            // Sort desc by order date and paging
            var orders = await _unitOfWork.Repository<Order>().GetPagingAsync(
                predicate: filter,
                pageIndex: data.PageIndex,
                pageSize: data.PageSize,
                orderBy: e => e.UpdatedAt,
                asc: false,
                selector: e => new OrderHistoryListItemDTO
                {
                    Id = e.Id,
                    Currency = e.Currency,
                    UpdatedAt = e.UpdatedAt,
                    OrderStatus = e.OrderStatus,
                    PaymentStatus = e.PaymentStatus,
                    TotalAmount = e.TotalAmount,
                    PaymentMethod = e.PaymentMethod
                });

            return new ApiSuccessResult<SystemOrdersDTO>(new()
            {
                Items = orders.Items,
                TotalItems = orders.TotalItems,
                PageIndex = data.PageIndex,
                PageSize = data.PageSize,
                TotalOrderAmount = orders.Items.Sum(e => e.TotalAmount),
                TotalPaidAmount = orders.Items
                    .Where(e => e.PaymentStatus == PayStatus.Paid)
                    .Sum(e => e.TotalAmount)
            });
        }

        public async Task<ApiResult> SetOrderStatus(string orderId, SetOrderStatusDTO data)
        {
            var order = await _unitOfWork.Repository<Order>().GetFirstAsync(
                predicate: e => e.Id == orderId,
                includes: e => e.OrderDetails)
                ?? throw new BadRequestException("Đơn hàng không tồn tại.");

            // Check if completed order
            if (order.OrderStatus == OrderStatus.Delivered ||
                order.OrderStatus == OrderStatus.Cancelled)
            {
                throw new BadRequestException("Đơn hàng đã hủy/hoàn thành.");
            }

            // Check Placed -> Accepted
            if (data.Status == OrderStatus.Accepted)
            {
                if (order.PaymentMethod == PaymentMethod.VNPay && 
                    order.PaymentStatus != PayStatus.Paid) 
                    throw new BadRequestException("Đơn hàng chưa thanh toán, vui lòng thử lại.");

                if (order.OrderStatus != OrderStatus.Placed)
                    throw new BadRequestException("Trạng thái đơn hàng không hợp lệ, vui lòng thử lại.");
            }

            // Check Accepted -> InProgress
            if (
                data.Status == OrderStatus.InProgress && 
                order.OrderStatus != OrderStatus.Accepted)
            {
                throw new BadRequestException("Trạng thái đơn hàng không hợp lệ, vui lòng thử lại.");
            }

            // Check InProgress -> Shipping
            if (
                data.Status == OrderStatus.Shipping &&
                order.OrderStatus != OrderStatus.InProgress)
            {
                throw new BadRequestException("Trạng thái đơn hàng không hợp lệ, vui lòng thử lại.");
            }

            // Update book info
            if (data.Status == OrderStatus.Delivered)
            {
                order.PaymentStatus = PayStatus.Paid;
                foreach (var e in order.OrderDetails)
                {
                    await _unitOfWork.Books.SetRemainingBooksInStock(e.BookId, e.Quantity);
                }
            }

            order.OrderStatus = data.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Repository<Order>().UpdateAsync(order);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult("Cập nhật trạng thái đơn hàng thành công");
        }

        public async Task<string> CreateOrderFromCart(List<OrderItemDTO> data, ClaimsPrincipal claims)
        {
            // Create order and details
            var order = new Order
            {
                Id = "ORDER" + DateTime.UtcNow.ToString("ddMMyyHHmmss"),
                Currency = "VND",
                CustomerId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!),
                OrderDate = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PaymentStatus = PayStatus.Unpaid,
                OrderStatus = OrderStatus.Created,
                PaymentMethod = PaymentMethod.CashOnDelivery,
                TotalAmount = data.Select(e => e.Price * e.Quantity).Sum(),
                AddressId = await _unitOfWork.Users.GetDefaultAddress(Guid.Parse(Helper.GetUserIdFromClaims(claims)!))
            };

            var orderDetails = data.Select(e => new OrderDetail()
            {
                BookId = e.BookId,
                OrderId = order.Id,
                BookName = e.Title,
                Price = e.Price,
                Quantity = e.Quantity,
            }).ToList();
            order.OrderDetails = orderDetails;

            await _unitOfWork.Repository<Order>().AddAsync(order);
            await _unitOfWork.SaveChangesAsync();

            // return order id
            return order.Id;
        }
    }
}
