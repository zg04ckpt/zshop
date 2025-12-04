using Core.DTOs.Common;

namespace Core.DTOs.Vouchers
{
    public class SearchVoucherDTO : BasePaging
    {
        public string? Name { get; set; }
        public string? Code { get; set; }
        public DateTime? Start { get; set; }
        public DateTime? End { get; set; }
    }
}
