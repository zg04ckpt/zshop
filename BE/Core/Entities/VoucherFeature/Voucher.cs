using Core.Entities.PaymentFeature;

namespace Core.Entities.VoucherFeature
{
    public class Voucher
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public DiscountType DiscountType { get; set; }
        public decimal Discount { get; set; }
        public decimal MaxDiscount { get; set; }
        public int? Quantity { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public bool IsActive { get; set; }
        public List<Order> AppliedOrders { get; set; } = new List<Order>();
    }
}
