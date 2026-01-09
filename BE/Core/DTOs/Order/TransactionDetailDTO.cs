using Core.Enums;
using System.Text.Json.Serialization;

namespace Core.DTOs.Order
{
    public class TransactionDetailDTO
    {
        public string Id { get; set; }
        public string OrderId { get; set; }
        public DateTime CreatedAt { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TransactionStatus Status { get; set; }

        public string? Note { get; set; }
        public decimal Amount { get; set; }
    }
}
