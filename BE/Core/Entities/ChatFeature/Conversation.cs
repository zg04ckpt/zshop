using Core.Entities.System;

namespace Core.Entities.ChatFeature
{
    public class Conversation
    {
        public Guid Id { get; set; }
        public string CustomerName { get; set; }
        public Guid? UserId { get; set; }

        public List<Message> Messages { get; set; } = new();
        public User? User { get; set; }
    }
}
