using Core.Services;
using FluentAssertions;
using Xunit;

namespace Core.Tests.Services
{
    public class RagSyncQueueTests
    {
        [Fact]
        public async Task EnqueueAndDequeue_ShouldWorkSuccessfully()
        {
            // Arrange
            var queue = new RagSyncQueue();
            var bookId = Guid.NewGuid();

            // Act
            await queue.EnqueueBookIdAsync(bookId);
            var dequeuedId = await queue.DequeueBookIdAsync(CancellationToken.None);

            // Assert
            dequeuedId.Should().Be(bookId);
        }

        [Fact]
        public async Task DequeueBookIdAsync_ShouldWaitUntilItemIsAvailable()
        {
            // Arrange
            var queue = new RagSyncQueue();
            var bookId = Guid.NewGuid();

            // Act
            var dequeueTask = queue.DequeueBookIdAsync(CancellationToken.None).AsTask();
            
            // At this point, the task shouldn't be completed
            dequeueTask.IsCompleted.Should().BeFalse();

            // Now enqueue the item
            await queue.EnqueueBookIdAsync(bookId);

            // Wait for it
            var result = await dequeueTask;

            // Assert
            result.Should().Be(bookId);
        }
    }
}
