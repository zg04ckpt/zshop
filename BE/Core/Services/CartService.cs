using Core.DTOs.Cart;
using Core.DTOs.Common;
using Core.DTOs.Order;
using Core.Entities.BookFeature;
using Core.Entities.PaymentFeature;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Services;
using Core.Utilities;
using System.Security.Claims;

namespace Core.Services
{
    public class CartService : ICartService
    {
        private readonly IPaymentService _paymentService;
        private readonly IUnitOfWork _unitOfWork;

        public CartService(IPaymentService paymentService, IUnitOfWork unitOfWork)
        {
            _paymentService = paymentService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResult> AddItemToCart(ClaimsPrincipal claims, AddItemToCartDTO data)
        {
            var cartRepo = _unitOfWork.Repository<Cart>();

            // Get cart of user, if null then create new one
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var cart = await cartRepo.GetFirstAsync(e => e.UserId == userId);
            if (cart == null)
            {
                cart = new Cart
                {
                    Id = "CART-" + DateTime.UtcNow.ToString("ddMMyyHHmmss"),
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                await cartRepo.AddAsync(cart);
            }

            // Before add items => need check if item alreay exists in cart and check if book exists
            if (await _unitOfWork.Repository<CartItem>().ExistsAsync(
                e => e.CartId == cart.Id && e.BookId == data.BookId))
            {
                throw new BadRequestException("Sách này đã được thêm vào giỏ hàng trước đó.");
            }

            var book = await _unitOfWork.Repository<Book>().GetFirstAsync(
                predicate: e => e.Id == data.BookId,
                selector: x => new
                {
                    x.Name,
                    x.Price
                })
                ?? throw new BadRequestException("Sách không tồn tại");

            await _unitOfWork.Repository<CartItem>().AddAsync(new CartItem()
            {
                CartId = cart.Id,
                BookId = data.BookId,
                Quantity = 1,
                BookTitle = book.Name,
                Price = book.Price            
            });
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult("Đã thêm " + book.Name + " vào giỏ hàng.");
        }

        public async Task<ApiResult<CartDTO>> GetCart(ClaimsPrincipal claims)
        {
            var cartRepo = _unitOfWork.Repository<Cart>();

            // Get cart of user, if null then create new one
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var cart = await cartRepo.GetFirstAsync(
                predicate: e => e.UserId == userId,
                selector: e => new CartDTO
                {
                    Id = e.Id,
                    UpdatedAt = e.UpdatedAt,
                    Items = e.Items.Select(i => new CartListItemDTO
                    {
                        BookId = i.BookId,
                        BookTitle = i.BookTitle,
                        Price = i.Book.Price,
                        BookCover = i.Book.Cover,
                        Quantity = i.Quantity
                    }).ToArray()
                });

            if (cart == null)
            {
                var newCart = new Cart
                {
                    Id = "CART-" + DateTime.UtcNow.ToString("ddMMyyHHmmss"),
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                await cartRepo.AddAsync(newCart);
                await _unitOfWork.SaveChangesAsync();

                cart = new CartDTO
                {
                    Id = newCart.Id,
                    Items = Array.Empty<CartListItemDTO>(),
                    UpdatedAt = newCart.UpdatedAt,
                };
            }

            return new ApiSuccessResult<CartDTO>(cart);
        }

        public async Task<ApiResult<string>> PayCart(PayCartDTO data, ClaimsPrincipal claims)
        {
            var cartRepo = _unitOfWork.Repository<Cart>();
            var userId = Helper.GetUserIdFromClaims(claims);

            // Check if cart exists
            var cart = await cartRepo.GetFirstAsync(
                predicate: e => e.UserId.ToString() == userId,
                includes: e => e.Items)
                ?? throw new BadRequestException("Giỏ hàng không tồn tại.");

            // Check if cart valid
            if (data.Items.Count == 0)
            {
                throw new BadRequestException("Số lượng sách không hợp lệ.");
            }

            // Check if book exists and remove from cart
            var orderItems = new List<OrderItemDTO>();
            var cartItems = cart.Items.ToDictionary(e => e.BookId);
            foreach (var item in data.Items)
            {
                if (cartItems.TryGetValue(item.BookId, out var cartItem))
                {
                    await _unitOfWork.Repository<CartItem>().DeleteAsync(cartItem);
                    orderItems.Add(new()
                    {
                        BookId = cartItem.BookId,
                        Price = cartItem.Price,
                        Quantity = item.Quantity,
                        Title = cartItem.BookTitle,
                    });
                }
                else
                {
                    throw new BadRequestException("Sách trong giỏ hàng không tồn tại.");
                }    
            }

            // Wait create order success to update cart and return order id
            var newOrderId = await _paymentService.CreateOrderFromCart(orderItems, claims);
            cart.UpdatedAt = DateTime.UtcNow;
            await cartRepo.UpdateAsync(cart);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult<string>("Tạo đơn hàng thành công.", newOrderId);
        }

        public async Task<ApiResult> RemoveItemFromCart(ClaimsPrincipal claims, string bookId)
        {
            // Check and get cart id
            var userId = Helper.GetUserIdFromClaims(claims);
            var cartId = await _unitOfWork.Repository<Cart>().GetFirstAsync(
                predicate: e => e.UserId.ToString() == userId,
                selector: e => e.Id.ToString())
                ?? throw new BadRequestException("Giỏ hàng chưa được khởi tạo, vui lòng thêm ít nhất một sách vào giỏ.");

            // Check if book already exists in cart
            var cartItem = await _unitOfWork.Repository<CartItem>().GetFirstAsync(
                e => e.CartId == cartId && e.BookId.ToString() == bookId)
                ?? throw new BadRequestException("Sách không tồn tại trong giỏ hàng, vui lòng thử lại.");

            await _unitOfWork.Repository<CartItem>().DeleteAsync(cartItem);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult("Xóa khỏi giỏ hàng thành công.");
        }
    }
}
