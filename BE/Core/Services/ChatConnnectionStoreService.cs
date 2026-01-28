
using Core.DTOs.Chat;
using System.Collections.Concurrent;

namespace Core.Services
{
    public class ChatConnnectionStoreService
    {
        private readonly ConcurrentDictionary<Guid, string> _conversationCustomerConnectionMapping;
        private string? _adminConnectionId;

        public ChatConnnectionStoreService()
        {
            _conversationCustomerConnectionMapping = new();
            _adminConnectionId = null;
        }

        public void AddConnection(Guid conversationId, string connectionId)
            => _conversationCustomerConnectionMapping.TryAdd(conversationId, connectionId);

        public void RemoveConnection(Guid conversationId)
            => _conversationCustomerConnectionMapping.TryRemove(conversationId, out _);

        public bool IsHasCustomerInConversation(Guid conversationId)
            => _conversationCustomerConnectionMapping.ContainsKey(conversationId);

        public List<Guid> GetAllConversations()
            => _conversationCustomerConnectionMapping.Keys.ToList();

        public bool IsAdminOnline() => _adminConnectionId != null;

        public void SetAdminOnline(string connectionId) => _adminConnectionId = connectionId;

        public void SetAdminOffline() => _adminConnectionId = null;

        public string? GetAdminConnectionId() => _adminConnectionId;
    }
}
