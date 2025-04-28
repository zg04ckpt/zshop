using Core.Entities.System;
using Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.PaymentFeature
{
    public class Order
    {
        public string Id { get; set; }
        public Guid CustomerId { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime UpdatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; }
        public OrderStatus OrderStatus { get; set; }
        public PayStatus PaymentStatus { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public Guid? AddressId { get; set; }

        // Rela
        public User Customer { get; set; }
        public Address? Address { get; set; }
        public List<OrderDetail> OrderDetails { get; set; }
        public List<Transaction> Transactions { get; set; }
        public List<CancelOrderRequest> CancelOrderRequests { get; set; }
    }
}
