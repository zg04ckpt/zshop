using Core.Configurations;
using Core.DTOs.Common;
using Core.DTOs.Order;
using Core.Entities.BookFeature;
using Core.Entities.PaymentFeature;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services.External;
using Core.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Moq;
using System.Linq.Expressions;
using System.Security.Claims;
using Xunit;

namespace Core.Tests.Services
{
    public class PaymentServiceTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IStorageService> _storageServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly IOptions<VNPayConfig> _vnPayConfig;
        private readonly IOptions<PaymentConfig> _paymentConfig;
        private readonly PaymentService _paymentService;

        private readonly Mock<IRepository<Book>> _bookRepositoryMock;
        private readonly Mock<IRepository<Order>> _orderRepositoryMock;
        private readonly Mock<IRepository<OrderDetail>> _orderDetailRepositoryMock;
        private readonly Mock<IUserRepository> _userRepositoryMock;

        public PaymentServiceTests()
        {
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _storageServiceMock = new Mock<IStorageService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();

            _vnPayConfig = Options.Create(new VNPayConfig());
            _paymentConfig = Options.Create(new PaymentConfig());

            _bookRepositoryMock = new Mock<IRepository<Book>>();
            _orderRepositoryMock = new Mock<IRepository<Order>>();
            _orderDetailRepositoryMock = new Mock<IRepository<OrderDetail>>();
            _userRepositoryMock = new Mock<IUserRepository>();

            _unitOfWorkMock.Setup(u => u.Repository<Book>()).Returns(_bookRepositoryMock.Object);
            _unitOfWorkMock.Setup(u => u.Repository<Order>()).Returns(_orderRepositoryMock.Object);
            _unitOfWorkMock.Setup(u => u.Repository<OrderDetail>()).Returns(_orderDetailRepositoryMock.Object);
            _unitOfWorkMock.Setup(u => u.Users).Returns(_userRepositoryMock.Object);

            _paymentService = new PaymentService(
                _vnPayConfig, 
                _paymentConfig, 
                _storageServiceMock.Object, 
                _httpContextAccessorMock.Object, 
                _unitOfWorkMock.Object);
        }

        private ClaimsPrincipal CreateClaimsPrincipal(string userId)
        {
            return new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            }));
        }

        [Fact]
        public async Task CreateOrderFromBook_ShouldThrowBadRequest_WhenBookNotFound()
        {
            // Arrange
            var claims = CreateClaimsPrincipal(Guid.NewGuid().ToString());
            _bookRepositoryMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<Book, bool>>>(), It.IsAny<Expression<Func<Book, object>>[]>()))
                .ReturnsAsync((Book)null);

            // Act & Assert
            var act = async () => await _paymentService.CreateOrderFromBook(Guid.NewGuid().ToString(), claims);
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Không tìm thấy sách.");
        }

        [Fact]
        public async Task CreateOrderFromBook_ShouldReturnOrderId_WhenSuccess()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var claims = CreateClaimsPrincipal(userId.ToString());
            var bookId = Guid.NewGuid();
            var book = new Book { Id = bookId, Price = 100000, Name = "Test Book" };

            _bookRepositoryMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<Book, bool>>>(), It.IsAny<Expression<Func<Book, object>>[]>()))
                .ReturnsAsync(book);
                
            _userRepositoryMock.Setup(x => x.GetDefaultAddress(userId))
                .ReturnsAsync(Guid.NewGuid());

            // Act
            var result = await _paymentService.CreateOrderFromBook(bookId.ToString(), claims);

            // Assert
            result.Should().BeOfType<ApiSuccessResult<string>>();
            result.Data.Should().StartWith("ORDER");
            _orderRepositoryMock.Verify(x => x.AddAsync(It.IsAny<Order>()), Times.Once);
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task GetUnConfirmedOrder_ShouldThrowBadRequest_WhenOrderNotFound()
        {
            // Arrange
            var claims = CreateClaimsPrincipal(Guid.NewGuid().ToString());
            _orderRepositoryMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<Order, bool>>>(), It.IsAny<Expression<Func<Order, object>>[]>()))
                .ReturnsAsync((Order)null);

            // Act & Assert
            var act = async () => await _paymentService.GetUnConfirmedOrder("ORDER123", claims);
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Đơn hàng không tồn tại.");
        }

        [Fact]
        public async Task GetUnConfirmedOrder_ShouldThrowBadRequest_WhenOrderStatusNotCreated()
        {
            // Arrange
            var claims = CreateClaimsPrincipal(Guid.NewGuid().ToString());
            var order = new Order { Id = "ORDER123", OrderStatus = Enums.OrderStatus.Placed };
            
            _orderRepositoryMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<Order, bool>>>(), It.IsAny<Expression<Func<Order, object>>[]>()))
                .ReturnsAsync(order);

            // Act & Assert
            var act = async () => await _paymentService.GetUnConfirmedOrder("ORDER123", claims);
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Đơn hàng đã được xác nhận, vui lòng truy cập lịch sử đơn hàng để xem thông tin.");
        }
    }
}
