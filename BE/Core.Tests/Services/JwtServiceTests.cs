using Core.Configurations;
using Core.Entities.System;
using Core.Interfaces.Services;
using Core.Services;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using System.Security.Claims;
using Xunit;

namespace Core.Tests.Services
{
    public class JwtServiceTests : IDisposable
    {
        private readonly Mock<IRedisService> _redisServiceMock;
        private readonly IOptions<JwtConfig> _jwtConfig;
        private readonly JwtService _jwtService;

        public JwtServiceTests()
        {
            _redisServiceMock = new Mock<IRedisService>();
            
            _jwtConfig = Options.Create(new JwtConfig
            {
                Issuer = "TestIssuer",
                Audience = "TestAudience",
                AccessTokenTTL = 15,
                RefreshTokenTTL = 1440
            });

            // Set environment variable for EnvHelper
            Environment.SetEnvironmentVariable("JWT_SECRET_KEY", "SuperSecretKey12345678901234567890");

            _jwtService = new JwtService(_jwtConfig, _redisServiceMock.Object);
        }

        public void Dispose()
        {
            Environment.SetEnvironmentVariable("JWT_SECRET_KEY", null);
        }

        [Fact]
        public void IssueToken_ShouldReturnToken_WhenValidDataIsProvided()
        {
            // Arrange
            var user = new User { Id = Guid.NewGuid() };
            var roles = new List<string> { "User" };

            // Act
            var token = _jwtService.IssueToken(user, roles, isLogin: true);

            // Assert
            token.Should().NotBeNull();
            token.AccessToken.Should().NotBeNullOrEmpty();
            token.RefreshToken.Should().NotBeNullOrEmpty();
            token.Type.Should().Be("Bearer");
            
            _redisServiceMock.Verify(x => x.Set(It.IsAny<string>(), user.Id.ToString(), token.RefreshToken, TimeSpan.FromMinutes(1440)), Times.Once);
        }

        [Fact]
        public void IssueToken_ShouldUpdateRefreshToken_WhenNotLogin()
        {
            // Arrange
            var user = new User { Id = Guid.NewGuid() };
            var roles = new List<string> { "User" };

            // Act
            var token = _jwtService.IssueToken(user, roles, isLogin: false);

            // Assert
            token.Should().NotBeNull();
            _redisServiceMock.Verify(x => x.UpdateAndKeepTTL(It.IsAny<string>(), user.Id.ToString(), token.RefreshToken), Times.Once);
        }

        [Fact]
        public void ValidateAccessToken_ShouldReturnClaims_WhenTokenIsValid()
        {
            // Arrange
            var user = new User { Id = Guid.NewGuid() };
            var roles = new List<string> { "User" };
            var tokenDto = _jwtService.IssueToken(user, roles, isLogin: true);

            // Act
            var claims = _jwtService.ValidateAccessToken(tokenDto.AccessToken);

            // Assert
            claims.Should().NotBeNull();
            claims.FindFirstValue(ClaimTypes.NameIdentifier).Should().Be(user.Id.ToString());
        }

        [Fact]
        public async Task RevokeToken_ShouldAddToBlacklist()
        {
            // Arrange
            var user = new User { Id = Guid.NewGuid() };
            var tokenDto = _jwtService.IssueToken(user, new List<string>(), true);

            // Act
            await _jwtService.RevokeToken(tokenDto.AccessToken);

            // Assert
            _redisServiceMock.Verify(x => x.Set(It.IsAny<string>(), tokenDto.AccessToken, "-", It.IsAny<TimeSpan>()), Times.Once);
        }
    }
}
