using Core.DTOs.Cart;
using Core.DTOs.Common;
using Core.DTOs.Order;
using Core.Entities.BookFeature;
using Core.Entities.PaymentFeature;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Services;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using System.Security.Claims;
using Xunit;

namespace Core.Tests.Services
{
    public class CartServiceTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IPaymentService> _paymentServiceMock;
        private readonly Mock<IRepository<Cart>> _cartRepositoryMock;
        private readonly Mock<IRepository<CartItem>> _cartItemRepositoryMock;
        private readonly Mock<IRepository<Book>> _bookRepositoryMock;
        private readonly CartService _cartService;

        public CartServiceTests()
        {
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _paymentServiceMock = new Mock<IPaymentService>();
            
            _cartRepositoryMock = new Mock<IRepository<Cart>>();
            _cartItemRepositoryMock = new Mock<IRepository<CartItem>>();
            _bookRepositoryMock = new Mock<IRepository<Book>>();

            _unitOfWorkMock.Setup(u => u.Repository<Cart>()).Returns(_cartRepositoryMock.Object);
            _unitOfWorkMock.Setup(u => u.Repository<CartItem>()).Returns(_cartItemRepositoryMock.Object);
            _unitOfWorkMock.Setup(u => u.Repository<Book>()).Returns(_bookRepositoryMock.Object);

            _cartService = new CartService(_paymentServiceMock.Object, _unitOfWorkMock.Object);
        }

        private ClaimsPrincipal CreateClaimsPrincipal(string userId)
        {
            return new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            }));
        }

        [Fact]
        public async Task AddItemToCart_ShouldThrowBadRequest_WhenItemAlreadyInCart()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var claims = CreateClaimsPrincipal(userId.ToString());
            var dto = new AddItemToCartDTO { BookId = Guid.NewGuid() };
            var cart = new Cart { Id = "CART-123", UserId = userId };

            _cartRepositoryMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<Cart, bool>>>(), It.IsAny<Expression<Func<Cart, object>>[]>()))
                .ReturnsAsync(cart);
            _cartItemRepositoryMock.Setup(x => x.ExistsAsync(It.IsAny<Expression<Func<CartItem, bool>>>()))
                .ReturnsAsync(true);

            // Act & Assert
            var act = async () => await _cartService.AddItemToCart(claims, dto);
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Sách này đã được thêm vào giỏ hàng trước đó.");
        }

        [Fact]
        public async Task RemoveItemFromCart_ShouldReturnSuccess_WhenItemExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var claims = CreateClaimsPrincipal(userId.ToString());
            var bookId = Guid.NewGuid();
            var cartId = "CART-123";
            var cartItem = new CartItem { CartId = cartId, BookId = bookId };

            _cartRepositoryMock.Setup(x => x.GetFirstAsync(
                It.IsAny<Expression<Func<Cart, bool>>>(), 
                It.IsAny<Expression<Func<Cart, string>>>()))
                .ReturnsAsync(cartId);
                
            _cartItemRepositoryMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<CartItem, bool>>>(), It.IsAny<Expression<Func<CartItem, object>>[]>()))
                .ReturnsAsync(cartItem);

            // Act
            var result = await _cartService.RemoveItemFromCart(claims, bookId.ToString());

            // Assert
            result.Should().BeOfType<ApiSuccessResult>();
            _cartItemRepositoryMock.Verify(x => x.DeleteAsync(cartItem), Times.Once);
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(), Times.Once);
        }
        
        [Fact]
        public async Task PayCart_ShouldThrowBadRequest_WhenCartDoesNotExist()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var claims = CreateClaimsPrincipal(userId.ToString());
            var dto = new PayCartDTO { Items = new List<PayCartItemDTO>() };

            _cartRepositoryMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<Cart, bool>>>(), It.IsAny<Expression<Func<Cart, object>>[]>()))
                .ReturnsAsync((Cart)null);

            // Act & Assert
            var act = async () => await _cartService.PayCart(dto, claims);
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Giỏ hàng không tồn tại.");
        }
    }
}
