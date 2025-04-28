using Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.PaymentFeature
{
    public class Transaction
    {
        public string Id { get; set; }
        public string OrderId { get; set; }
        public DateTime CreatedAt { get; set; }
        public TransactionStatus Status { get; set; }
        public string? Note { get; set; }
        public decimal Amount { get; set; }
        // Rela
        public Order Order { get; set; }
    }
}
