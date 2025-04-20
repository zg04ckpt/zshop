using CloudinaryDotNet;
using Core.Configurations;
using Core.DTOs.Book;
using Core.DTOs.Common;
using Core.DTOs.Order;
using Core.DTOs.User;
using Core.Entities.PaymentFeature;
using Core.Enums;
using Core.Exceptions;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Security.Claims;

namespace Core.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IBookRepository _bookRepository;
        private readonly IUserRepository _userRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IReviewRepository _reviewRepository;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IOrderDetailRepository _orderDetailRepository;
        private readonly ICancelOrderRequestRespository _cancelOrderRequestRespository;
        private readonly IStorageService _storageService;
        private readonly VNPayConfig _vnPayConfig;
        private readonly PaymentConfig _paymentConfig;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PaymentService(
            IOptions<VNPayConfig> vnPayConfigInstance,
            IOptions<PaymentConfig> paymentConfigInstance,
            IBookRepository bookRepository,
            IOrderRepository orderRepository,
            IOrderDetailRepository orderDetailRepository,
            ITransactionRepository transactionRepository,
            IUserRepository userRepository,
            IStorageService storageService,
            ICancelOrderRequestRespository cancelOrderRequestRespository,
            IHttpContextAccessor httpContextAccessor,
            IReviewRepository reviewRepository)
        {
            _bookRepository = bookRepository;
            _vnPayConfig = vnPayConfigInstance.Value;
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _paymentConfig = paymentConfigInstance.Value;
            _transactionRepository = transactionRepository;
            _userRepository = userRepository;
            _storageService = storageService;
            _cancelOrderRequestRespository = cancelOrderRequestRespository;
            _httpContextAccessor = httpContextAccessor;
            _reviewRepository = reviewRepository;
        }
        public async Task<ApiResult<string>> CreateOrderFromBook(string bookId, ClaimsPrincipal claims)
        {
            // Get price of books
            var book = await _bookRepository.Get(Guid.Parse(bookId))
                ?? throw new BadRequestException("Không tìm thấy sách.");

            // Create order and detail, default has only 1 book
            var order = new Order
            {
                Id = "ORDER-" + DateTime.Now.ToString("ddMMyyHHmmss"),
                Currency = "VND",
                CustomerId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!),
                OrderDate = DateTime.Now,
                PaymentStatus = PayStatus.Unpaid,
                OrderStatus = OrderStatus.Created,
                PaymentMethod = PaymentMethod.CashOnDelivery,
                TotalAmount = book.Price,
                AddressId = await _userRepository.GetDefaultAddress(Guid.Parse(Helper.GetUserIdFromClaims(claims)!))
            };
            var orderDetail = new OrderDetail {
                BookId = book.Id,
                BookName = book.Name,
                OrderId = order.Id,
                Price = book.Price,
                Quantity = 1,
            };

            await _orderRepository.Add(order);
            await _orderDetailRepository.Add(orderDetail);
            await _orderRepository.Save();

            // return order id
            return new ApiSuccessResult<string>(order.Id);
        }

        public async Task<ApiResult<OrderDTO>> GetUnConfirmedOrder(string orderId, ClaimsPrincipal claims)
        {
            // Check valid order
            var order = await _orderRepository.Get(orderId)
                ?? throw new BadRequestException("Đơn hàng không tồn tại.");
            if (order.OrderStatus != OrderStatus.Created)
                throw new BadRequestException($"Đơn hàng đã được xác nhận, vui lòng truy cập lịch sử đơn hàng để xem thông tin.");

            // check valid customer
            if (order.CustomerId.ToString() != Helper.GetUserIdFromClaims(claims))
                throw new ForbbidenException();

            var detail = await _orderDetailRepository
                .GetAll(e => e.OrderId == orderId)
                .ToArrayAsync();

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

        public async Task<ApiResult<string>> PayByVNPay(string orderId, OrderDTO data, string ip, ClaimsPrincipal claims)
        {
            // Get order info
            var order = await _orderRepository.GetQuery()
                .Include(e => e.OrderDetails)
                .FirstOrDefaultAsync(e => e.Id == orderId)
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

            // update order info (in case user change number of item)
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
            order.PaymentMethod = PaymentMethod.VNPay;
            order.TotalAmount = Math.Round(order.TotalAmount, 0, MidpointRounding.AwayFromZero);
            order.AddressId = data.AddressId;
            order.UpdatedAt = DateTime.Now;
            _orderRepository.Update(order);
            _orderDetailRepository.UpdateRange(order.OrderDetails);

            // Create a transaction
            var transaction = new Transaction
            {
                Id = "TRA" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                Amount = order.TotalAmount,
                CreatedAt = DateTime.Now,
                OrderId = orderId,
                Status = TransactionStatus.Processing,
            };
            await _transactionRepository.Add(transaction);
            await _transactionRepository.Save();

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
            vnpay.AddRequestData("vnp_OrderType", _vnPayConfig.vnp_OrderType); //default value: other
            vnpay.AddRequestData("vnp_ReturnUrl", _vnPayConfig.vnp_ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", transaction.Id); // Mã tham chiếu = Mã giao dịch
            vnpay.AddRequestData("vnp_ExpireDate", DateTime.Now.AddMinutes(_paymentConfig.ExpireInMinutes).ToString("yyyyMMddHHmmss"));

            string paymentUrl = vnpay.CreateRequestUrl(
                _vnPayConfig.vnp_Url, EnvHelper.GetVNpayHashSecret());

            return new ApiSuccessResult<string>(paymentUrl);
        }
        
        public async Task<ApiResult<string>> CashOnDelivery(string orderId, OrderDTO data, ClaimsPrincipal claims)
        {
            // Get order info
            var order = await _orderRepository.GetQuery()
                .Include(e => e.OrderDetails)
                .FirstOrDefaultAsync(e => e.Id == orderId)
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
                throw new BadRequestException("Đơn hàng đã được gửi đi, vui lòng kiểm tra lịch sử thanh toán để biết thêm chi tiết.");
            }
            if (order.PaymentStatus != PayStatus.Unpaid)
            {
                throw new BadRequestException("Đơn hàng đã được thanh toán, vui lòng kiểm tra lịch sử thanh toán để biết thêm chi tiết.");
            }

            // update order info (in case user change number of item)
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
            order.PaymentMethod = PaymentMethod.CashOnDelivery;
            order.OrderStatus = OrderStatus.Placed;
            order.TotalAmount = Math.Round(order.TotalAmount, 0, MidpointRounding.AwayFromZero);
            order.AddressId = data.AddressId;
            order.UpdatedAt = DateTime.Now;
            _orderRepository.Update(order);
            _orderDetailRepository.UpdateRange(order.OrderDetails);
            await _orderRepository.Save();

            var request = _httpContextAccessor.HttpContext!.Request;
            return new ApiSuccessResult<string>(
                $"{request.Scheme}://{request.Host}/payment/order-success?orderId=" + orderId);
        }

        public async Task<string> GetCashOnDeliveryOrderSuccess(string orderId)
        {
            // Get order info
            var order = await _orderRepository.Get(orderId)
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
                var transaction = await _transactionRepository.GetQuery()
                    .Include(e => e.Order)
                    .FirstOrDefaultAsync()
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
                    transaction.Order.UpdatedAt = DateTime.Now;
                    _orderRepository.Update(transaction.Order);
                    _transactionRepository.Update(transaction);
                    await _orderRepository.Save();

                    string page = await _storageService.GetHtmlTemplate("payment_success_page.html");
                    page = page.Replace("[amount]", transaction.Amount.ToString("N0", new CultureInfo("vi-VN")));
                    page = page.Replace("[currency]", transaction.Order.Currency);
                    page = page.Replace("[orderId]", transaction.Order.Id);
                    page = page.Replace("[clientHomePageUrl]", _paymentConfig.ClientHomeUrl);
                    return page;
                }
                else
                {
                    // Update order status
                    transaction.Order.PaymentStatus = PayStatus.Failed;
                    transaction.Order.UpdatedAt = DateTime.Now;
                    _orderRepository.Update(transaction.Order);
                    _transactionRepository.Update(transaction);
                    await _orderRepository.Save();

                    string page = await _storageService.GetHtmlTemplate("payment_failure_page.html");
                    page = page.Replace("[mess]", errorMessage);
                    page = page.Replace("[orderId]", transaction.Order.Id);
                    page = page.Replace("[clientHomePageUrl]", _paymentConfig.ClientHomeUrl);
                    return page;
                }

            }
            catch (Exception ex)
            {
                string page = await _storageService.GetHtmlTemplate("payment_failure_page.html");
                page = page.Replace("[mess]", "Lỗi xử lý kết quả");
                page = page.Replace("[orderId]", "--");
                page = page.Replace("[clientHomePageUrl]", _paymentConfig.ClientHomeUrl);
                return page;
            }
        }

        public async Task<string> UpdateVNPayTransactionStatus(Dictionary<string, string> data)
        {
            //var vnpayLib = new VNPayLib();
            //foreach (var kvp in data)
            //{
            //    if (!string.IsNullOrEmpty(kvp.Key) && kvp.Key.StartsWith("vnp_"))
            //    {
            //        vnpayLib.AddResponseData(kvp.Key, kvp.Value);
            //    }
            //}

            //// Get result
            //string orderId = vnpayLib.GetResponseData("vnp_TxnRef");
            //long amount = Convert.ToInt64(vnpayLib.GetResponseData("vnp_Amount"))/100;
            //string vnpayTranId = vnpayLib.GetResponseData("vnp_TransactionNo");
            //string vnp_ResponseCode = vnpayLib.GetResponseData("vnp_ResponseCode");
            //string vnp_TransactionStatus = vnpayLib.GetResponseData("vnp_TransactionStatus");
            //string vnp_OrderInfo = vnpayLib.GetResponseData("vnp_OrderInfo");
            //string vnp_SecureHash = vnpayLib.GetResponseData("vnp_SecureHash");

            //// Check secure hash
            //if (!vnpayLib.ValidateSignature(vnp_SecureHash, EnvHelper.GetVNpayHashSecret()))
            //{
            //    await RecordTransaction(vnpayTranId, amount, null, 
            //        TransactionStatus.Invalid, $"Chữ kí không hợp lệ (Nội dung thanh toán: {vnp_OrderInfo})");
            //    return "{\"RspCode\":\"97\",\"Message\":\"Invalid signature\"}";
            //}

            //// Check if orderId valid
            //var order = await _orderDetailsRepository.Get(orderId);
            //if (order is null)
            //{
            //    await RecordTransaction(vnpayTranId, amount, null,
            //        TransactionStatus.Invalid, $"Đơn hàng không tồn tại (Nội dung thanh toán: {vnp_OrderInfo})");
            //    return "{\"RspCode\":\"01\",\"Message\":\"Order not found\"}";
            //}


            //// Check if order already paid
            //if (order.PaymentStatus != PayStatus.Paid)
            //{
            //    return "{\"RspCode\":\"02\",\"Message\":\"Order already confirmed\"}";
            //}


            //// Check if amount valid
            //if ((long)order.TotalAmount !=  amount)
            //{
            //    // <send mail>
            //    await RecordTransaction(vnpayTranId, amount, order.Id,
            //        TransactionStatus.NeedRefund, $"Số tiền thanh toán không hợp lệ (Nội dung thanh toán: {vnp_OrderInfo})");
            //    return "{\"RspCode\":\"04\",\"Message\":\"invalid amount\"}";
            //}


            //// Update order status
            //if (vnp_ResponseCode == "00" && vnp_TransactionStatus == "00")
            //{
            //    await RecordTransaction(vnpayTranId, amount, order.Id,
            //        TransactionStatus.Success, null);
            //    order.PaymentStatus = PayStatus.Paid;
            //    order.OrderStatus = OrderStatus.Placed;
            //}
            //else
            //{
            //    await RecordTransaction(vnpayTranId, amount, order.Id,
            //        TransactionStatus.Failure, $"Lỗi không xác định (Nội dung thanh toán: {vnp_OrderInfo})");
            //    order.PaymentStatus = PayStatus.Failed;
            //    return "{\"RspCode\":\"99\",\"Message\":\"unknown error\"}";
            //}

            //// Save order status
            //_orderDetailsRepository.Update(order);
            //await _orderDetailsRepository.Save();
            //return "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";

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
            var transaction = await _transactionRepository.GetQuery()
                .Include(e => e.Order)
                .FirstOrDefaultAsync()
                ?? throw new InternalServerErrorException("Giao dịch không tồn tại.");

            // Update amount with real paid amount
            transaction.Amount = amount;

            // Check valid
            if (!vnpayLib.ValidateSignature(vnp_SecureHash, EnvHelper.GetVNpayHashSecret()))
            {
                errorMessage = "{\"RspCode\":\"97\",\"Message\":\"Invalid signature\"}";
                transaction.Status = TransactionStatus.Failure;
                transaction.Note = $"Chữ kí không hợp lệ (Nội dung thanh toán: {vnp_OrderInfo})";
            }
            else if (transaction.Order.TotalAmount != transaction.Amount)
            {
                errorMessage = "{\"RspCode\":\"04\",\"Message\":\"invalid amount\"}";
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
                errorMessage = "{\"RspCode\":\"99\",\"Message\":\"unknown error\"}";
                transaction.Status = TransactionStatus.Failure;
                transaction.Note = $"Lỗi không xác định (Nội dung thanh toán: {vnp_OrderInfo})";
            }

            // return result by static page
            if (transaction.Status == TransactionStatus.Success)
            {
                // Update order status
                transaction.Order.OrderStatus = OrderStatus.Placed;
                transaction.Order.PaymentStatus = PayStatus.Paid;
                transaction.Order.UpdatedAt = DateTime.Now;
                _orderRepository.Update(transaction.Order);
                _transactionRepository.Update(transaction);
                await _orderRepository.Save();

                return "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";
            }
            else
            {
                // Update order status
                transaction.Order.PaymentStatus = PayStatus.Failed;
                transaction.Order.UpdatedAt = DateTime.Now;
                _orderRepository.Update(transaction.Order);
                _transactionRepository.Update(transaction);
                await _orderRepository.Save();

                return errorMessage!;
            }
        }

        public async Task<ApiResult<Paginated<OrderHistoryListItemDTO>>> GetOrderHistory(OrderHistorySearchDTO data, ClaimsPrincipal claims)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var orders = await _orderRepository.GetQuery().AsNoTracking()
                .Where(e => e.CustomerId == userId)
                .OrderByDescending(e => e.UpdatedAt)
                .Skip(data.Size * (data.Page - 1))
                .Take(data.Size)
                .Select(e => new OrderHistoryListItemDTO
                {
                    Id = e.Id,
                    Currency = e.Currency,
                    UpdatedAt = e.UpdatedAt,
                    OrderDate = e.OrderDate,
                    OrderStatus = e.OrderStatus,
                    PaymentStatus = e.PaymentStatus,
                    TotalAmount = e.TotalAmount,
                    PaymentMethod = e.PaymentMethod
                })
                .ToArrayAsync();
            var totalRecords = await _orderRepository.GetQuery()
                .Where(e => e.CustomerId == userId).CountAsync();
            var totalPage = (int)Math.Ceiling((double)totalRecords / data.Size);
            return new ApiSuccessResult<Paginated<OrderHistoryListItemDTO>>(new ()
            {
               Data = orders,
               TotalPage = totalPage,
               TotalRecord  = totalRecords,
            });
        }

        public async Task<ApiResult<OrderHistoryDetailDTO>> GetOrderHistoryDetail(string orderId, ClaimsPrincipal claims)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var query = _orderRepository.GetQuery().AsNoTracking();

            // Admin can view any order in system, user only view order that  by
            if (Helper.CheckRoleFromClaims("Admin", claims))
            {
                query = query.Where(e => e.Id == orderId);
            }
            else
            {
                query = query.Where(e => e.Id == orderId && e.CustomerId == userId);
            }    
            var data = await query
                .Select(e => new OrderHistoryDetailDTO
                {
                    Id = e.Id,
                    UserId = e.CustomerId.ToString(),
                    OrderDate = e.OrderDate,
                    UpdatedAt = e.UpdatedAt,
                    Currency = e.Currency,
                    TotalAmount = e.TotalAmount,
                    OrderStatus = e.OrderStatus,
                    PaymentStatus = e.PaymentStatus,
                    PaymentMethod = e.PaymentMethod,
                    Items = e.OrderDetails.Select(od => new OrderItemDTO {
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
                    } : null
                }).FirstOrDefaultAsync()
                ?? throw new BadRequestException("Đơn hàng không hợp lệ.");

            return new ApiSuccessResult<OrderHistoryDetailDTO>(data);
        }

        public async Task<ApiResult> CancelOrder(string orderId, CancelOrderRequestDTO data, ClaimsPrincipal claims)
        {
            // Check valid user and valid order
            var order = await _orderRepository.Get(orderId);
            if (order is null || order.OrderStatus == OrderStatus.Cancelled)
                throw new BadRequestException("Đơn hàng đã bị hủy hoặc không tồn tại.");
            if (order.CustomerId.ToString() != Helper.GetUserIdFromClaims(claims))
                throw new ForbbidenException();

            // User cannot request more than one time.
            if (await _cancelOrderRequestRespository.IsExists(e => e.OrderId == orderId))
            {
                throw new BadRequestException("Yêu cầu đã được gửi đi trước đó, vui lòng đợi người bán xác nhận.");
            }

            // Only orders with following status can be cancelled: Created, Placed, Accepted, InProgress
            if (
                order.OrderStatus == OrderStatus.Shipping ||
                order.OrderStatus == OrderStatus.Delivered)
            {
                throw new BadRequestException("Đơn hàng không thể hủy do đang được vận chuyển hoặc đã được giao.");
            }

            // Accepted and InProgress status must be allowed by shop owner (admin) before cancelling
            if (
                order.OrderStatus == OrderStatus.Accepted ||
                order.OrderStatus == OrderStatus.InProgress)
            {
                await _cancelOrderRequestRespository.Add(new()
                {
                    OrderId = order.Id,
                    Reason = data.Reason,
                    CreatedAt = DateTime.Now,
                });
                await _cancelOrderRequestRespository.Save();

                return new ApiSuccessResult("Đang gửi yêu cầu hủy đơn hàng, vui lòng đợi người bán chấp nhận.");
            }

            // Remaining statuses can be cancelled immediately
            order.OrderStatus = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.Now;
            _orderRepository.Update(order);
            await _orderRepository.Save();

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
            var request = await _cancelOrderRequestRespository.GetQuery()
                .Include(e => e.Order)
                .FirstOrDefaultAsync()
                ?? throw new BadRequestException("Yêu cầu hủy không tồn tại.");

            if (isAccepted)
            {
                request.Order.OrderStatus = OrderStatus.Cancelled;
                _orderRepository.Update(request.Order);
            }

            // remove request
            _cancelOrderRequestRespository.Delete(request);
            await _cancelOrderRequestRespository.Save();

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
            var query = _cancelOrderRequestRespository.GetQuery().AsNoTracking();
            var totalRecords = await query.CountAsync();
            var totalPage = (int)Math.Ceiling((double)totalRecords / 100);
            return new ApiSuccessResult<Paginated<CancelOrderRequestListItemDTO>>(new()
            {
                TotalPage = totalPage,
                TotalRecord = totalRecords,
                Data = await query
                    .OrderByDescending(e => e.CreatedAt)
                    .Skip(100 * (page - 1)).Take(100)
                    .Select(e => new CancelOrderRequestListItemDTO
                    {
                        Id = e.Id,
                        Reason = e.Reason,
                        Amount = e.Order.TotalAmount,
                        Currency = e.Order.Currency,
                        CreatedAt = e.CreatedAt,
                        OrderId = e.OrderId
                    }).ToArrayAsync()
            });
        }

        public async Task<ApiResult<SystemOrdersDTO>> GetAllSystemOrder(SystemOrderSearchDTO data)
        {
            var query = _orderRepository.GetQuery().AsNoTracking();

            // Filter by status
            if (data.Status != null)
                query = query.Where(e => e.OrderStatus == data.Status);

            // Filter by date range
            query = query.Where(e => 
                e.OrderDate >= data.StartDate &&  
                e.OrderDate <= data.EndDate);

            // Sort desc by order date and paging
            var orders = await query
                .OrderByDescending(e => e.UpdatedAt)
                .Skip(data.Size * (data.Page - 1))
                .Take(data.Size)
                .Select(e => new OrderHistoryListItemDTO
                {
                    Id = e.Id,
                    Currency = e.Currency,
                    UpdatedAt = e.UpdatedAt,
                    OrderStatus = e.OrderStatus,
                    PaymentStatus = e.PaymentStatus,
                    TotalAmount = e.TotalAmount,
                    PaymentMethod = e.PaymentMethod
                })
                .ToArrayAsync();
            var totalRecords = await query.CountAsync();
            var totalPage = (int)Math.Ceiling((double)totalRecords / data.Size);
            return new ApiSuccessResult<SystemOrdersDTO>(new()
            {
                Data = orders,
                TotalPage = totalPage,
                TotalRecord = totalRecords,
                TotalOrderAmount = await query.SumAsync(e => e.TotalAmount),
                TotalPaidAmount = await query
                    .Where(e => e.PaymentStatus == PayStatus.Paid)
                    .SumAsync(e => e.TotalAmount)
            });
        }

        public async Task<ApiResult> SetOrderStatus(string orderId, SetOrderStatusDTO data)
        {
            var order = await _orderRepository.Get(orderId) 
                ?? throw new BadRequestException("Đơn hàng không tồn tại.");

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

            order.OrderStatus = data.Status;
            order.UpdatedAt = DateTime.Now;
            _orderRepository.Update(order);
            await _orderRepository.Save();

            return new ApiSuccessResult("Cập nhật trạng thái đơn hàng thành công");
        }

        public async Task<string> CreateOrderFromCart(List<OrderItemDTO> data, ClaimsPrincipal claims)
        {
            // Create order and details
            var order = new Order
            {
                Id = "ORDER-" + DateTime.Now.ToString("ddMMyyHHmmss"),
                Currency = "VND",
                CustomerId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!),
                OrderDate = DateTime.Now,
                UpdatedAt = DateTime.Now,
                PaymentStatus = PayStatus.Unpaid,
                OrderStatus = OrderStatus.Created,
                PaymentMethod = PaymentMethod.CashOnDelivery,
                TotalAmount = data.Select(e => e.Price * e.Quantity).Sum(),
                AddressId = await _userRepository.GetDefaultAddress(Guid.Parse(Helper.GetUserIdFromClaims(claims)!))
            };

            var orderDetails = data.Select(e => new OrderDetail()
            {
                BookId = e.BookId,
                OrderId = order.Id,
                BookName = e.Title,
                Price = e.Price,
                Quantity = e.Quantity,
            });

            await _orderRepository.Add(order);
            await _orderDetailRepository.AddRange(orderDetails);
            await _orderRepository.Save();

            // return order id
            return order.Id;
        }

        
    }
}
