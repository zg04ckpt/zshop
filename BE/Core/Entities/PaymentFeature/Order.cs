using Core.Entities.System;
using Core.Entities.VoucherFeature;
using Core.Enums;

namespace Core.Entities.PaymentFeature
{
    public class Order
    {
        public string Id { get; set; }
        public Guid CustomerId { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime UpdatedAt { get; set; }
        public decimal Amount { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; }
        public OrderStatus OrderStatus { get; set; }
        public PayStatus PaymentStatus { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public Guid? AddressId { get; set; }
        public string? VoucherId { get; set; }

        // Rela
        public User Customer { get; set; }
        public Address? Address { get; set; }
        public Voucher? Voucher { get; set; }
        public List<OrderDetail> OrderDetails { get; set; }
        public List<Transaction> Transactions { get; set; }
        public List<CancelOrderRequest> CancelOrderRequests { get; set; }
    }
}
