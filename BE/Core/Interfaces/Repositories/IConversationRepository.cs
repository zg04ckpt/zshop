using Core.DTOs.Chat;
using Core.DTOs.Common;
using Core.Entities.ChatFeature;

namespace Core.Interfaces.Repositories
{
    public interface IConversationRepository : IRepository<Conversation>
    {
        Task<Paginated<ConversationListItemDTO>> GetConversationsAsync(int index, int size);
    }
}
