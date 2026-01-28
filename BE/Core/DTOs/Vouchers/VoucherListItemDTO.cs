using Core.Entities.VoucherFeature;
using System.Text.Json.Serialization;

namespace Core.DTOs.Vouchers
{
    public class VoucherListItemDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}
