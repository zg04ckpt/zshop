using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.PaymentFeature
{
    public class CancelOrderRequest
    {
        public int Id { get; set; }
        public string OrderId { get; set; }
        public string Reason { get; set; }
        public DateTime CreatedAt { get; set; }
        //rela
        public Order Order { get; set; }
    }
}
