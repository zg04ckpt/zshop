using Core.Entities.BookFeature;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.PaymentFeature
{
    public class CartItem
    {
        public string CartId { get; set; }
        public Guid BookId { get; set; }
        public string BookTitle { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }

        // Rela
        public Cart Cart { get; set; }
        public Book Book { get; set; }
    }
}
