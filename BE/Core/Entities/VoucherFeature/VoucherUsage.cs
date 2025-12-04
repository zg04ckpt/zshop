using Core.Entities.PaymentFeature;

namespace Core.Entities.VoucherFeature
{
    public class VoucherUsage
    {
        public string OrderId { get; set; }
        public Order Order { get; set; }
        public string VoucherId { get; set; }
        public Voucher Voucher { get; set; }
    }
}
