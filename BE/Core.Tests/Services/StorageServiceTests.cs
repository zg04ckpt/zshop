using Core.Services.External;
using FluentAssertions;
using Xunit;

namespace Core.Tests.Services.External
{
    public class StorageServiceTests
    {
        [Fact]
        public async Task GetHtmlTemplate_ShouldReturnContent_WhenFileExists()
        {
            // Arrange
            var dir = Path.Combine(AppContext.BaseDirectory, "resources", "templates");
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }
            
            var filePath = Path.Combine(dir, "test.html");
            await File.WriteAllTextAsync(filePath, "<html>test</html>");

            Environment.SetEnvironmentVariable("CLOUDINARY_CLOUD_NAME", "test");
            Environment.SetEnvironmentVariable("CLOUDINARY_API_KEY", "test");
            Environment.SetEnvironmentVariable("CLOUDINARY_API_SECRET", "test");

            var service = new StorageService();

            // Act
            var result = await service.GetHtmlTemplate("test.html");

            // Assert
            result.Should().Be("<html>test</html>");

            // Clean up
            File.Delete(filePath);
        }
    }
}
