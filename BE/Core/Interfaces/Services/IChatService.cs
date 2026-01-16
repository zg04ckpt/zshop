using Core.DTOs.Chat;
using Core.DTOs.Common;
using Core.Entities.ChatFeature;

namespace Core.Interfaces.Services
{
    public interface IChatService
    {
        Task<ApiResult<ConversationDTO>> StartConversationAsync(string? customerName, Guid? userId);
        Task<ApiResult<Paginated<ConversationListItemDTO>>> GetConversationsAsync(int page);
        Task<MessageListItemDTO> SendMessageAsync(Guid conversationId, string content, MessageType messageType);
        Task<ApiResult<ConversationDTO>> GetConversationByIdAsync(Guid conversationId);
        Task<ApiResult<Guid[]>> DeleteConversationsAsync(DeleteConversationsRequest request);
        
    }
}
