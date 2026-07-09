using Core.DTOs.Common;
using Core.DTOs.User;
using Core.Entities.System;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;
using System.Linq.Expressions;
using System.Security.Claims;
using Xunit;

namespace Core.Tests.Services
{
    public class UserServiceTests
    {
        private readonly Mock<IUnitOfWork> _uowMock;
        private readonly Mock<IStorageService> _storageMock;
        private readonly Mock<IVNAddressDataService> _vnAddressMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IRepository<Address>> _addressRepoMock;

        private readonly UserService _service;
        private readonly ClaimsPrincipal _claims;
        private readonly Guid _userId;

        public UserServiceTests()
        {
            _uowMock = new Mock<IUnitOfWork>();
            _storageMock = new Mock<IStorageService>();
            _vnAddressMock = new Mock<IVNAddressDataService>();
            _userRepoMock = new Mock<IUserRepository>();
            _addressRepoMock = new Mock<IRepository<Address>>();

            _uowMock.Setup(u => u.Users).Returns(_userRepoMock.Object);
            _uowMock.Setup(u => u.Repository<Address>()).Returns(_addressRepoMock.Object);
            
            // Mock repository generic <User>
            var genericUserRepoMock = new Mock<IRepository<User>>();
            _uowMock.Setup(u => u.Repository<User>()).Returns(genericUserRepoMock.Object);

            _service = new UserService(_uowMock.Object, _storageMock.Object, _vnAddressMock.Object);

            _userId = Guid.NewGuid();
            _claims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, _userId.ToString())
            }));
        }

        [Fact]
        public async Task GetProfile_ShouldThrowException_WhenUserNotExists()
        {
            // Arrange
            _userRepoMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<Expression<Func<User, object>>[]>()))
                .ReturnsAsync((User)null);

            // Act
            var act = async () => await _service.GetProfile(_claims);

            // Assert
            await act.Should().ThrowAsync<BadRequestException>();
        }

        [Fact]
        public async Task GetProfile_ShouldReturnProfile()
        {
            // Arrange
            var user = new User { Id = _userId, FirstName = "First", LastName = "Last" };
            _userRepoMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<Expression<Func<User, object>>[]>()))
                .ReturnsAsync(user);

            // Act
            var result = await _service.GetProfile(_claims);

            // Assert
            result.Data.FirstName.Should().Be("First");
            result.Data.LastName.Should().Be("Last");
        }

        [Fact]
        public async Task UpdateProfile_ShouldReturnSuccess()
        {
            // Arrange
            var user = new User { Id = _userId, FirstName = "First", LastName = "Last" };
            _userRepoMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<Expression<Func<User, object>>[]>()))
                .ReturnsAsync(user);

            var req = new UpdateUserProfileDTO { FirstName = "New", LastName = "NewLast" };

            // Act
            var result = await _service.UpdateProfile(_claims, req);

            // Assert
            result.Message.Should().Be("Cập nhật thành công.");
            _userRepoMock.Verify(x => x.UpdateAsync(It.IsAny<User>()), Times.Once);
            _uowMock.Verify(x => x.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task AddAddress_ShouldThrowException_WhenCityInvalid()
        {
            // Arrange
            var user = new User { Id = _userId };
            _userRepoMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<Expression<Func<User, object>>[]>()))
                .ReturnsAsync(user);
            _vnAddressMock.Setup(x => x.IsValidCity(It.IsAny<string>(), It.IsAny<int>())).Returns(false);

            var req = new AddressDTO { City = "Invalid", CityCode = 999 };

            // Act
            var act = async () => await _service.AddAddress(_claims, req);

            // Assert
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Tỉnh/Thành phố không hợp lệ.");
        }

        [Fact]
        public async Task AddAddress_ShouldSucceed()
        {
            // Arrange
            var user = new User { Id = _userId };
            _userRepoMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<Expression<Func<User, object>>[]>()))
                .ReturnsAsync(user);
            _vnAddressMock.Setup(x => x.IsValidCity(It.IsAny<string>(), It.IsAny<int>())).Returns(true);
            _vnAddressMock.Setup(x => x.IsValidDistrict(It.IsAny<string>(), It.IsAny<int>())).Returns(true);
            _vnAddressMock.Setup(x => x.IsValidWard(It.IsAny<string>(), It.IsAny<int>())).Returns(true);

            var req = new AddressDTO { City = "Valid", Detail = "Detail", ReceiverName = "Receiver" };

            // Act
            var result = await _service.AddAddress(_claims, req);

            // Assert
            result.IsSuccess.Should().BeTrue();
            _addressRepoMock.Verify(x => x.AddAsync(It.IsAny<Address>()), Times.Once);
        }

        [Fact]
        public async Task GetAddresses_ShouldReturnList()
        {
            // Arrange
            var user = new User { Id = _userId, DefaultAddressId = Guid.NewGuid() };
            _userRepoMock.Setup(x => x.GetFirstAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<Expression<Func<User, object>>[]>()))
                .ReturnsAsync(user);

            var addresses = new List<AddressItemDTO>
            {
                new AddressItemDTO { Id = user.DefaultAddressId.ToString() }
            };

            _addressRepoMock.Setup(x => x.GetAllAsync(It.IsAny<Expression<Func<Address, bool>>>(), It.IsAny<Expression<Func<Address, AddressItemDTO>>>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<Expression<Func<Address, object>>>(), It.IsAny<bool?>()))
                .ReturnsAsync(addresses);

            // Act
            var result = await _service.GetAddresses(_claims);

            // Assert
            result.Data.Should().HaveCount(1);
        }

        [Fact]
        public async Task DeleteUser_ShouldThrowException_WhenUserNotFound()
        {
            // Arrange
            var userRepoMock = new Mock<IRepository<User>>();
            _uowMock.Setup(u => u.Repository<User>()).Returns(userRepoMock.Object);

            // Act
            var act = async () => await _service.DeleteUser(Guid.NewGuid());

            // Assert
            await act.Should().ThrowAsync<BadRequestException>();
        }
    }
}
