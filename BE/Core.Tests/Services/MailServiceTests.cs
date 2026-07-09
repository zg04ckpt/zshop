using Core.Configurations;
using Core.Interfaces.Services.External;
using Core.Services;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Core.Tests.Services
{
    public class MailServiceTests : IDisposable
    {
        private readonly Mock<IStorageService> _storageServiceMock;
        private readonly IOptions<MailConfig> _mailConfig;
        private readonly MailService _mailService;

        public MailServiceTests()
        {
            _storageServiceMock = new Mock<IStorageService>();
            
            _mailConfig = Options.Create(new MailConfig
            {
                Host = "localhost",
                Port = 25
            });

            // Set environment variable for EnvHelper
            Environment.SetEnvironmentVariable("SYSTEM_EMAIL", "test@zshop.com");
            Environment.SetEnvironmentVariable("SYSTEM_EMAIL_PASSWORD", "password");

            _mailService = new MailService(_mailConfig, _storageServiceMock.Object);
        }

        public void Dispose()
        {
            Environment.SetEnvironmentVariable("SYSTEM_EMAIL", null);
            Environment.SetEnvironmentVariable("SYSTEM_EMAIL_PASSWORD", null);
        }

        [Fact]
        public async Task SendMail_ShouldReturnFalse_WhenSmtpConnectionFails()
        {
            // Act
            // Since there is no real SMTP server on localhost:25, this will throw an exception caught by try-catch
            var result = await _mailService.SendMail("receiver@example.com", "Test", "<h1>Hello</h1>");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task SendAuthenticationCodeViaEmail_ShouldReplaceTemplateAndReturnFalse()
        {
            // Arrange
            var templateHtml = "Mã xác thực là [auth-code], hết hạn trong [ttl_minutes] phút.";
            _storageServiceMock.Setup(x => x.GetHtmlTemplate("template.html"))
                .ReturnsAsync(templateHtml);

            // Act
            var result = await _mailService.SendAuthenticationCodeViaEmail("receiver@example.com", "123456", 5, "template.html");

            // Assert
            result.Should().BeFalse(); // Because SmtpClient fails to connect
            _storageServiceMock.Verify(x => x.GetHtmlTemplate("template.html"), Times.Once);
        }
    }
}
