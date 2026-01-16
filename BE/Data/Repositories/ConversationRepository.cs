using Core.DTOs.Chat;
using Core.DTOs.Common;
using Core.Entities.ChatFeature;
using Core.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    public class ConversationRepository : Repository<Conversation>, IConversationRepository
    {
        public ConversationRepository(DbContext context) : base(context)
        {
        }

        public async Task<Paginated<ConversationListItemDTO>> GetConversationsAsync(int index, int size)
        {
            var query = _context.Set<Conversation>()
                .AsNoTracking()
                .Select(c => new ConversationListItemDTO
                {
                    Id = c.Id,
                    CustomerName = c.CustomerName,
                    IsCustomerOnline = false,
                    IsAnonymousConversation = c.UserId == null,
                    LastMessage = _context.Set<Message>()
                        .Where(m => m.ConvertsationId == c.Id)
                        .OrderByDescending(m => m.Timestamp)
                        .Select(m => new MessageListItemDTO
                        {
                            Id = m.Id,
                            Content = m.Content,
                            Timestamp = m.Timestamp,
                            IsRead = m.IsRead,
                            Type = m.Type,
                            
                        })
                        .First()
                })
                .OrderByDescending(c => c.LastMessage!.Timestamp);

            var total = await query.CountAsync();

            var items = await query
                .Skip((index - 1) * size)
                .Take(size)
                .ToListAsync();

            return new Paginated<ConversationListItemDTO>
            {
                PageIndex = index,
                PageSize = size,
                TotalItems = total,
                Items = items
            };
        }
    }
}
