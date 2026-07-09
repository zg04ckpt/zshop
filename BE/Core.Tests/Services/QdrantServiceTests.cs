using Core.Services;
using FluentAssertions;
using Xunit;

namespace Core.Tests.Services
{
    public class QdrantServiceTests : IDisposable
    {
        public QdrantServiceTests()
        {
            Environment.SetEnvironmentVariable("QDRANT_HOST", "localhost");
            Environment.SetEnvironmentVariable("QDRANT_PORT", "6334");
        }

        public void Dispose()
        {
            Environment.SetEnvironmentVariable("QDRANT_HOST", null);
            Environment.SetEnvironmentVariable("QDRANT_PORT", null);
        }

        [Fact]
        public void Constructor_ShouldInstantiateClient_WhenEnvVarsArePresent()
        {
            // Act
            var service = new QdrantService();

            // Assert
            service.Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteVectorsAsync_ShouldNotThrow_WhenListIsEmpty()
        {
            // Arrange
            var service = new QdrantService();

            // Act
            var act = async () => await service.DeleteVectorsAsync(new List<Guid>());

            // Assert
            await act.Should().NotThrowAsync();
        }
        
        [Fact]
        public async Task DeleteVectorsAsync_ShouldNotThrow_WhenListIsNull()
        {
            // Arrange
            var service = new QdrantService();

            // Act
            var act = async () => await service.DeleteVectorsAsync(null);

            // Assert
            await act.Should().NotThrowAsync();
        }
    }
}
