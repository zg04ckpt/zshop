using Core.DTOs.Cart;
using Core.DTOs.Common;
using Core.DTOs.Order;
using Core.Entities.PaymentFeature;
using Core.Exceptions;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Utilities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IBookRepository _bookRepository;
        private readonly ICartItemRepository _cartItemRepository;
        private readonly IPaymentService _paymentService;

        public CartService(
            ICartRepository cartRepository,
            ICartItemRepository cartItemRepository,
            IBookRepository bookRepository,
            IPaymentService paymentService)
        {
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _bookRepository = bookRepository;
            _paymentService = paymentService;
        }

        public async Task<ApiResult> AddItemToCart(ClaimsPrincipal claims, AddItemToCartDTO data)
        {
            // Get cart of user, if null then create new one
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var cart = await _cartRepository.Get(e => e.UserId == userId);
            if (cart == null)
            {
                cart = new Cart
                {
                    Id = "CART-" + DateTime.Now.ToString("ddMMyyHHmmss"),
                    UserId = userId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };
                await _cartRepository.Add(cart);
            }

            // Before add items => need check if item alreay exists in cart and check if book exists
            if (await _cartItemRepository.IsExists(
                e => e.CartId == cart.Id && 
                e.BookId == data.BookId))
            {
                throw new BadRequestException("Sách này đã được thêm vào giỏ hàng trước đó.");
            }
            var book = await _bookRepository.GetQuery().AsNoTracking()
                .Where(e => e.Id == data.BookId)
                .Select(x => new
                {
                    x.Name,
                    x.Price
                })
                .FirstOrDefaultAsync()
                ?? throw new BadRequestException("Sách không tồn tại");


            await _cartItemRepository.Add(new()
            {
                CartId = cart.Id,
                BookId = data.BookId,
                Quantity = 1,
                BookTitle = book.Name,
                Price = book.Price            
            });
            await _cartItemRepository.Save();

            return new()
            {
                IsSuccess = true,
                Message = "Đã thêm " + book.Name + " vào giỏ hàng."
            };
        }

        public async Task<ApiResult<CartDTO>> GetCart(ClaimsPrincipal claims)
        {
            // Get cart of user, if null then create new one
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var cart = await _cartRepository.GetQuery()
                .Where(e => e.UserId == userId)
                .Select(e => new CartDTO
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
                })
                .FirstOrDefaultAsync();
            if (cart == null)
            {
                var newCart = new Cart
                {
                    Id = "CART-" + DateTime.Now.ToString("ddMMyyHHmmss"),
                    UserId = userId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };
                await _cartRepository.Add(newCart);
                await _cartRepository.Save();

                cart = new CartDTO
                {
                    Id = newCart.Id,
                    Items = Array.Empty<CartListItemDTO>(),
                    UpdatedAt = newCart.UpdatedAt,
                };
            }

            return new()
            {
                IsSuccess = true,
                Data = cart
            };
        }

        public async Task<ApiResult<string>> PayCart(PayCartDTO data, ClaimsPrincipal claims)
        {
            var userId = Helper.GetUserIdFromClaims(claims);

            // Check if cart exists
            var cart = await _cartRepository.GetQuery().AsNoTracking()
                .Include(e => e.Items)
                .FirstOrDefaultAsync(e => e.UserId.ToString() == userId)
                ?? throw new BadRequestException("Giỏ hàng không tồn tại.");

            // Check if book exists and remove from cart
            var orderItems = new List<OrderItemDTO>();
            var cartItems = cart.Items.ToDictionary(e => e.BookId);
            foreach (var item in data.Items)
            {
                if (cartItems.TryGetValue(item.BookId, out var cartItem))
                {
                    _cartItemRepository.Delete(cartItem);
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
            cart.UpdatedAt = DateTime.Now;
            _cartRepository.Update(cart);
            await _cartRepository.Save();

            return new ApiResult<string>
            {
                IsSuccess = true,
                Data = newOrderId,
                Message = "Tạo đơn hàng thành công."
            };
        }

        public async Task<ApiResult> RemoveItemFromCart(ClaimsPrincipal claims, string bookId)
        {
            // Check and get cart id
            var userId = Helper.GetUserIdFromClaims(claims);
            var cartId = await _cartRepository.GetQuery().AsNoTracking()
                .Where(e => e.UserId.ToString() == userId)
                .Select(e => e.Id.ToString())
                .FirstOrDefaultAsync()
                ?? throw new BadRequestException("Giỏ hàng chưa được khởi tạo, vui lòng thêm ít nhất một sách vào giỏ.");

            // Check if book already exists in cart
            var cartItem = await _cartItemRepository.GetQuery().AsNoTracking()
                .Where(e => e.CartId == cartId && e.BookId.ToString() == bookId)
                .FirstOrDefaultAsync()
                ?? throw new BadRequestException("Sách không tồn tại trong giỏ hàng, vui lòng thử lại.");

            _cartItemRepository.Delete(cartItem);
            await _cartItemRepository.Save();

            return new ApiSuccessResult("Xóa khỏi giỏ hàng thành công.");
        }
    }
}
