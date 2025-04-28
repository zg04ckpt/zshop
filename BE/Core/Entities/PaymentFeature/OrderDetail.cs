using Core.Entities.BookFeature;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.PaymentFeature
{
    public class OrderDetail
    {
        public string OrderId { get; set; }
        public string BookName { get; set; }
        public Guid BookId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        // Rela
        public Book Book { get; set; }
        public Order Order { get; set; }
    }
}
