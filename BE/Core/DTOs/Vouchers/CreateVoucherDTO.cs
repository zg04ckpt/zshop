using Core.Entities.VoucherFeature;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Core.DTOs.Vouchers
{
    public class CreateVoucherDTO
    {
        [Required(ErrorMessage = "Vui lòng điền tên voucher")]
        [StringLength(50, ErrorMessage = "Tên voucher dài tối đa {1} kí tự")]
        public string Name { get; set; }


        [JsonConverter(typeof(JsonStringEnumConverter))]
        [Required(ErrorMessage = "Vui lòng chọn kiểu ưu đãi")]
        public DiscountType DiscountType { get; set; }


        [Required(ErrorMessage = "Vui lòng đặt mức giảm giá")]
        public decimal Discount { get; set; }


        [Required(ErrorMessage = "Vui lòng đặt mức giảm giá tối đa")]
        public decimal MaxDiscount { get; set; }


        public int? Quantity { get; set; }
        public int? RemainingQuantity { get; set; }


        [Required(ErrorMessage = "Vui lòng chọn thời điểm có hiệu lực")]
        public DateTime ValidFrom { get; set; }


        [Required(ErrorMessage = "Vui lòng đặt khoảng thời gian có hiệu lực")]
        public TimeSpan Duration { get; set; }
    }
}
