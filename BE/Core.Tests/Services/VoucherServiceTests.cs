using Core.DTOs.Vouchers;
using Core.Entities.VoucherFeature;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Services;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Core.Tests.Services
{
    public class VoucherServiceTests
    {
        private readonly Mock<IUnitOfWork> _uowMock;
        private readonly Mock<IRepository<Voucher>> _voucherRepoMock;
        private readonly VoucherService _service;

        public VoucherServiceTests()
        {
            _uowMock = new Mock<IUnitOfWork>();
            _voucherRepoMock = new Mock<IRepository<Voucher>>();

            _uowMock.Setup(u => u.Repository<Voucher>()).Returns(_voucherRepoMock.Object);

            _service = new VoucherService(_uowMock.Object);
        }

        [Fact]
        public async Task CreateVoucher_ShouldThrowException_WhenNameExists()
        {
            // Arrange
            _voucherRepoMock.Setup(x => x.ExistsAsync(It.IsAny<Expression<Func<Voucher, bool>>>()))
                .ReturnsAsync(true);

            var req = new CreateVoucherDTO { Name = "Existing" };

            // Act
            var act = async () => await _service.CreateVoucher(req);

            // Assert
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Tên đã tồn tại");
        }

        [Fact]
        public async Task CreateVoucher_ShouldThrowException_WhenDiscountAmountIsInvalid()
        {
            // Arrange
            _voucherRepoMock.Setup(x => x.ExistsAsync(It.IsAny<Expression<Func<Voucher, bool>>>()))
                .ReturnsAsync(false);

            var req = new CreateVoucherDTO 
            { 
                Name = "New",
                DiscountType = DiscountType.Amount,
                Discount = 100,
                MaxDiscount = 200 // Different
            };

            // Act
            var act = async () => await _service.CreateVoucher(req);

            // Assert
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Số tiền giảm giá không thể khác số tiền tối đa");
        }

        [Fact]
        public async Task CreateVoucher_ShouldReturnSuccess()
        {
            // Arrange
            _voucherRepoMock.Setup(x => x.ExistsAsync(It.IsAny<Expression<Func<Voucher, bool>>>()))
                .ReturnsAsync(false);

            var req = new CreateVoucherDTO 
            { 
                Name = "New",
                DiscountType = DiscountType.Amount,
                Discount = 100,
                MaxDiscount = 100
            };

            // Act
            var result = await _service.CreateVoucher(req);

            // Assert
            result.Data.Should().NotBeNull();
            _voucherRepoMock.Verify(x => x.AddAsync(It.IsAny<Voucher>()), Times.Once);
            _uowMock.Verify(x => x.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task ChangeVoucherActivation_ShouldToggleActivation()
        {
            // Arrange
            var voucher = new Voucher { Id = "vid", IsActive = true };
            _voucherRepoMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<Voucher, bool>>>(), It.IsAny<Expression<Func<Voucher, object>>[]>()))
                .ReturnsAsync(voucher);

            // Act
            var result = await _service.ChangeVoucherActivation("vid");

            // Assert
            result.Data.Should().Be("vid");
            voucher.IsActive.Should().BeFalse();
            _voucherRepoMock.Verify(x => x.UpdateAsync(It.IsAny<Voucher>()), Times.Once);
        }

        [Fact]
        public async Task DeleteVoucher_ShouldCallDelete()
        {
            // Arrange
            var voucher = new Voucher { Id = "vid" };
            _voucherRepoMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<Voucher, bool>>>(), It.IsAny<Expression<Func<Voucher, object>>[]>()))
                .ReturnsAsync(voucher);

            // Act
            var result = await _service.DeleteVoucher("vid");

            // Assert
            result.Message.Should().Be("Xóa voucher thành công");
            _voucherRepoMock.Verify(x => x.DeleteAsync(It.IsAny<Voucher>()), Times.Once);
        }
    }
}
