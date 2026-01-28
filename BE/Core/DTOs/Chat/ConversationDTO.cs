namespace Core.DTOs.Chat
{
    public class ConversationDTO
    {
        public Guid Id { get; set; }
        public string CustomerName { get; set; }
        public Guid? UserId { get; set; }
        public bool IsAdminOnline { get; set; }
        public bool IsCustomerOnline { get; set; }

        public List<MessageListItemDTO> Messages { get; set; }
    }
}
