using Core.Entities.ChatFeature;
using System.Text.Json.Serialization;

namespace Core.DTOs.Chat
{
    public class MessageListItemDTO
    {
        public int Id { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public MessageType Type { get; set; }
        public bool IsRead { get; set; }
        public string Content { get; set; }
        public DateTimeOffset Timestamp { get; set; }
    }
}
