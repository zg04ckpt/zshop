namespace Core.DTOs.Chat
{
    public class ConversationListItemDTO
    {
        public Guid Id { get; set; }
        public string CustomerName { get; set; }
        public bool IsCustomerOnline { get; set; }
        public MessageListItemDTO? LastMessage { get; set; }
        public bool IsAnonymousConversation { get; set; }
    }
}
