namespace Core.Entities.ChatFeature
{
    public class Message
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
        public Guid ConvertsationId { get; set; }
        public bool IsRead { get; set; }
        public MessageType Type { get; set; }

        public Conversation Conversation { get; set; }
    }
}
