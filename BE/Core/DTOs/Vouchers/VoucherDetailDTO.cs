using Core.Entities.VoucherFeature;
using System.Text.Json.Serialization;

namespace Core.DTOs.Vouchers
{
    public class VoucherDetailDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }


        [JsonConverter(typeof(JsonStringEnumConverter))]
        public DiscountType DiscountType { get; set; }


        [JsonConverter(typeof(JsonStringEnumConverter))]
        public VoucherStatus Status { get; set; }

        public bool IsActive { get; set; }
        public decimal Discount { get; set; }
        public decimal MaxDiscount { get; set; }
        public int? Quantity { get; set; }
        public int? RemainingQuantity { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
    }
}
