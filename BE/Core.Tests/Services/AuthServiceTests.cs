using Core.Configurations;
using Core.DTOs.Auth;
using Core.DTOs.Common;
using Core.Entities.System;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Services;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using System.Security.Claims;
using Xunit;

namespace Core.Tests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IJwtService> _jwtServiceMock;
        private readonly Mock<IRedisService> _redisServiceMock;
        private readonly Mock<IMailService> _mailServiceMock;
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly IOptions<AuthConfig> _authConfig;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _jwtServiceMock = new Mock<IJwtService>();
            _redisServiceMock = new Mock<IRedisService>();
            _mailServiceMock = new Mock<IMailService>();
            _userRepositoryMock = new Mock<IUserRepository>();

            _unitOfWorkMock.Setup(u => u.Users).Returns(_userRepositoryMock.Object);

            _authConfig = Options.Create(new AuthConfig
            {
                MaxFailedAttempts = 5,
                LoginLockFlagTTL = 15,
                ConfirmEmailAuthCodeTTL = 5,
                ResetPassAuthCodeTTL = 5
            });

            _authService = new AuthService(
                _unitOfWorkMock.Object,
                _jwtServiceMock.Object,
                _authConfig,
                _redisServiceMock.Object,
                _mailServiceMock.Object);
        }

        [Fact]
        public async Task LogIn_ShouldReturnLoginResponseDTO_WhenCredentialsAreValid()
        {
            // Arrange
            var loginDto = new LoginDTO { Email = "test@example.com", Password = "password123" };
            var hashedPassword = Core.Utilities.Helper.HashPassword(loginDto.Password);
            
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                Password = hashedPassword,
                IsActivated = true,
                IsEmailComfirmed = true,
                AccessFailedCount = 0
            };

            _userRepositoryMock.Setup(x => x.GetFirstAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
                .ReturnsAsync(user);
                
            _redisServiceMock.Setup(x => x.GetTTL(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(0);

            _userRepositoryMock.Setup(x => x.GetRolesOfUser(user.Id))
                .ReturnsAsync(new List<Role> { new Role { Name = "User" } });

            var expectedToken = new JwtTokenDTO { AccessToken = "access", RefreshToken = "refresh" };
            _jwtServiceMock.Setup(x => x.IssueToken(user, It.IsAny<List<string>>(), true))
                .Returns(expectedToken);

            // Act
            var result = await _authService.LogIn(loginDto);

            // Assert
            result.Should().NotBeNull();
            result.Token.Should().Be(expectedToken);
            result.User.UserId.Should().Be(user.Id.ToString());
            _userRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>()), Times.Once);
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task LogIn_ShouldThrowBadRequestException_WhenEmailDoesNotExist()
        {
            // Arrange
            var loginDto = new LoginDTO { Email = "notfound@example.com", Password = "123" };
            _userRepositoryMock.Setup(x => x.GetFirstAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
                .ReturnsAsync((User)null);

            // Act & Assert
            var act = async () => await _authService.LogIn(loginDto);
            await act.Should().ThrowAsync<BadRequestException>().WithMessage("Email không tồn tại");
        }

        [Fact]
        public async Task LogOut_ShouldReturnSuccess_WhenAccessTokenIsProvided()
        {
            // Arrange
            var token = "valid_token";

            // Act
            var result = await _authService.LogOut(token);

            // Assert
            result.Should().BeOfType<ApiSuccessResult>();
            _jwtServiceMock.Verify(x => x.RevokeToken(token), Times.Once);
        }

        [Fact]
        public async Task Register_ShouldReturnSuccess_WhenDataIsValid()
        {
            // Arrange
            var dto = new RegisterDTO 
            { 
                FirstName = "Test", LastName = "User", 
                Email = "new@example.com", PhoneNumber = "123456789", 
                UserName = "testuser", Password = "password123" 
            };

            _userRepositoryMock.Setup(x => x.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
                .ReturnsAsync(false);
            
            _redisServiceMock.Setup(x => x.Set(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan>()))
                .ReturnsAsync(true);
            
            _mailServiceMock.Setup(x => x.SendAuthenticationCodeViaEmail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<string>()))
                .ReturnsAsync(true);

            // Act
            var result = await _authService.Register(dto);

            // Assert
            result.Should().BeOfType<ApiSuccessResult>();
            _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Once);
            _userRepositoryMock.Verify(x => x.AddUserRoles(It.IsAny<User>(), "User"), Times.Once);
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(), Times.Once);
        }
    }
}
