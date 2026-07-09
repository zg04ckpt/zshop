using Core.Services;
using FluentAssertions;
using Xunit;

namespace Core.Tests.Services
{
    public class ChatConnnectionStoreServiceTests
    {
        private readonly ChatConnnectionStoreService _store;

        public ChatConnnectionStoreServiceTests()
        {
            _store = new ChatConnnectionStoreService();
        }

        [Fact]
        public void AddConnection_ShouldAddSuccessfully()
        {
            var conversationId = Guid.NewGuid();
            _store.AddConnection(conversationId, "conn-123");
            _store.IsHasCustomerInConversation(conversationId).Should().BeTrue();
        }

        [Fact]
        public void RemoveConnection_ShouldRemoveSuccessfully()
        {
            var conversationId = Guid.NewGuid();
            _store.AddConnection(conversationId, "conn-123");
            _store.RemoveConnection(conversationId);
            _store.IsHasCustomerInConversation(conversationId).Should().BeFalse();
        }

        [Fact]
        public void GetAllConversations_ShouldReturnCorrectCount()
        {
            var id1 = Guid.NewGuid();
            var id2 = Guid.NewGuid();
            _store.AddConnection(id1, "conn-1");
            _store.AddConnection(id2, "conn-2");

            var conversations = _store.GetAllConversations();
            conversations.Should().Contain(new[] { id1, id2 });
            conversations.Count.Should().Be(2);
        }

        [Fact]
        public void AdminOnlineOffline_ShouldWorkCorrectly()
        {
            _store.IsAdminOnline().Should().BeFalse();
            _store.GetAdminConnectionId().Should().BeNull();

            _store.SetAdminOnline("admin-conn");
            _store.IsAdminOnline().Should().BeTrue();
            _store.GetAdminConnectionId().Should().Be("admin-conn");

            _store.SetAdminOffline();
            _store.IsAdminOnline().Should().BeFalse();
            _store.GetAdminConnectionId().Should().BeNull();
        }
    }
}
