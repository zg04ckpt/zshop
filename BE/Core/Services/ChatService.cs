using Core.DTOs.Chat;
using Core.DTOs.Common;
using Core.Entities.ChatFeature;
using Core.Entities.System;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Services;

namespace Core.Services
{
    public class ChatService : IChatService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ChatConnnectionStoreService _store;

        public ChatService(
            IUnitOfWork unitOfWork, 
            ChatConnnectionStoreService store)
        {
            _unitOfWork = unitOfWork;
            _store = store;
        }

        public async Task<ApiResult<Guid[]>> DeleteConversationsAsync(DeleteConversationsRequest request)
        {
            var repo = _unitOfWork.Conversations;

            var onlineConversationIds = _store.GetAllConversations();
            var conversationsToDelete = request.ConversationIds
                .Where(id => !onlineConversationIds.Contains(id))
                .ToList();

            if (!conversationsToDelete.Any())
            {
                throw new BadRequestException("Không thể xóa bất cứ đoạn hội thoại nào");
            }

            var conversations = await repo.GetAllAsync(predicate: e => conversationsToDelete.Contains(e.Id));
            await repo.DeleteAsync(conversations.ToArray());
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult<Guid[]>(
                "Xóa hội thoại thành công!", 
                conversations.Select(e => e.Id).ToArray());
        }

        public async Task<ApiResult<ConversationDTO>> GetConversationByIdAsync(Guid conversationId)
        {
            var conversation = await _unitOfWork.Repository<Conversation>().GetFirstAsync(
                predicate: x => x.Id == conversationId,
                selector: e => new ConversationDTO
                {
                    Id = e.Id,
                    UserId = e.UserId,
                    CustomerName = e.CustomerName,
                    IsAdminOnline = false,
                    IsCustomerOnline = false,
                    Messages = e.Messages.Select(m => new MessageListItemDTO
                    {
                        Id = m.Id,
                        Content = m.Content,
                        Timestamp = m.Timestamp,
                        IsRead = m.IsRead,
                        Type = m.Type,
                    }).ToList()
                })
                ?? throw new BadRequestException("Hội thoại không tồn tại");
            return new ApiSuccessResult<ConversationDTO>(conversation);
        }

        public async Task<ApiResult<Paginated<ConversationListItemDTO>>> GetConversationsAsync(int page)
        {
            var conversations = await _unitOfWork.Conversations.GetConversationsAsync(page, 20);
            var onlineConversations = _store.GetAllConversations().ToHashSet();
            foreach (var item in conversations.Items)
            {
                if (onlineConversations.Contains(item.Id))
                {
                    item.IsCustomerOnline = true;
                }
            }
            return new ApiSuccessResult<Paginated<ConversationListItemDTO>>(conversations);
        }

        public async Task<MessageListItemDTO> SendMessageAsync(Guid conversionId, string content, MessageType messageType)
        {
            if (!await _unitOfWork.Repository<Conversation>().ExistsAsync(e => e.Id == conversionId))
            {
                throw new BadRequestException("Hội thoại không tồn tại");
            }

            var mess = new Message
            {
                Content = content,
                ConvertsationId = conversionId,
                IsRead = false,
                Type = messageType,
                Timestamp = DateTime.UtcNow
            };
            await _unitOfWork.Repository<Message>().AddAsync(mess);
            await _unitOfWork.SaveChangesAsync();

            return new MessageListItemDTO
            {
                Id = mess.Id,
                Content = mess.Content,
                IsRead = mess.IsRead,
                Type = mess.Type,
                Timestamp = mess.Timestamp
            };
        }

        public async Task<ApiResult<ConversationDTO>> StartConversationAsync(string? customerName, Guid? userId)
        {
            if (customerName is null && userId is null)
            {
                throw new BadRequestException("Hội thoại cần bắt đầu với tên khách hàng/mã user");
            }

            var conversationRepo = _unitOfWork.Repository<Conversation>();

            // Return existing conversation with user id
            if (userId is not null)
            {
                var existingConversation = await conversationRepo.GetFirstAsync(
                    predicate: x => x.UserId == userId,
                    selector: e => new ConversationDTO
                    {
                        Id = e.Id,
                        UserId = e.UserId,
                        CustomerName = e.CustomerName,
                        IsAdminOnline = _store.IsAdminOnline(),
                        IsCustomerOnline = true,
                        Messages = e.Messages.Select(m => new MessageListItemDTO
                        {
                            Id = m.Id,
                            Content = m.Content,
                            Timestamp = m.Timestamp,
                            IsRead = m.IsRead,
                            Type = m.Type,
                        }).ToList()
                    });

                if (existingConversation is not null)
                {
                    return new ApiSuccessResult<ConversationDTO>(existingConversation!);
                }
            }

            // Create new conversation if not exits
            if (customerName is null)
            {
                customerName = await _unitOfWork.Repository<User>().GetFirstAsync(
                    predicate: e => e.Id == userId,
                    selector: e => e.LastName + " " + e.FirstName)
                    ?? throw new InternalServerErrorException("Người dùng không tồn tại");
            }

            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                CustomerName = customerName,
                UserId = userId
            };

            // Add default message
            conversation.Messages.Add(new Message
            {
                Content = $"Xin chào {conversation.CustomerName}, chúng tôi có thể giúp gì cho bạn",
                ConvertsationId = conversation.Id,
                IsRead = true,
                Timestamp = DateTime.UtcNow,
                Type = MessageType.Auto
            });

            await conversationRepo.AddAsync(conversation);
            await _unitOfWork.SaveChangesAsync();

            var conversationData = new ConversationDTO
            {
                Id = conversation.Id,
                CustomerName = conversation.CustomerName,
                UserId = userId,
                IsAdminOnline = _store.IsAdminOnline(),
                IsCustomerOnline = true,
                Messages = conversation.Messages.Select(m => new MessageListItemDTO
                {
                    Id = m.Id,
                    Content = m.Content,
                    IsRead = m.IsRead,
                    Timestamp = m.Timestamp,
                    Type = m.Type
                }).ToList(),
            };

            return new ApiSuccessResult<ConversationDTO>(conversationData);
        }
    }
}
