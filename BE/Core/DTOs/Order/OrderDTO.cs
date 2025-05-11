using Core.Enums;
using System.Text.Json.Serialization;

namespace Core.DTOs.Order
{
    public class OrderDTO
    {
        public string Id { get; set; }
        public OrderItemDTO[] Items { get; set; }
        public Guid? AddressId { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public PaymentMethod PaymentMethod { get; set; }
    }
}
