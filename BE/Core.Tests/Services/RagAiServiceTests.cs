using Core.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Core.Tests.Services
{
    public class RagAiServiceTests : IDisposable
    {
        private readonly IConfiguration _configuration;

        public RagAiServiceTests()
        {
            var inMemorySettings = new Dictionary<string, string> {
                {"AiSettings:ChatModel", "test-model"},
                {"AiSettings:EmbeddingModel", "test-embed-model"}
            };

            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            Environment.SetEnvironmentVariable("RAG_API_KEY", "test-api-key");
            Environment.SetEnvironmentVariable("RAG_ENDPOINT", "http://localhost:9999/"); // Fake endpoint
        }

        public void Dispose()
        {
            Environment.SetEnvironmentVariable("RAG_API_KEY", null);
            Environment.SetEnvironmentVariable("RAG_ENDPOINT", null);
        }

        [Fact]
        public void Constructor_ShouldInstantiateClient_WhenConfigProvided()
        {
            // Act
            var service = new RagAiService(_configuration);

            // Assert
            service.Should().NotBeNull();
        }

        [Fact]
        public async Task GetEmbeddingAsync_ShouldThrowException_WhenEndpointIsUnreachable()
        {
            // Arrange
            var service = new RagAiService(_configuration);

            // Act
            var act = async () => await service.GetEmbeddingAsync("Test text");

            // Assert
            await act.Should().ThrowAsync<Exception>();
        }

        [Fact]
        public async Task ExtractKeywordsAsync_ShouldThrowException_WhenEndpointIsUnreachable()
        {
            // Arrange
            var service = new RagAiService(_configuration);

            // Act
            var act = async () => await service.ExtractKeywordsAsync("Test text");

            // Assert
            await act.Should().ThrowAsync<Exception>();
        }

        [Fact]
        public async Task GenerateAnswerAsync_ShouldThrowException_WhenEndpointIsUnreachable()
        {
            // Arrange
            var service = new RagAiService(_configuration);

            // Act
            var act = async () => await service.GenerateAnswerAsync("Test question", "Test context");

            // Assert
            await act.Should().ThrowAsync<Exception>();
        }
    }
}
