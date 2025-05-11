using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Cart
{
    public class CartDTO
    {
        public string Id { get; set; }
        public DateTime UpdatedAt { get; set; }
        public CartListItemDTO[] Items { get; set; }
    }

    public class CartListItemDTO
    {
        public Guid BookId { get; set; }
        public string BookTitle { get; set; }
        public string BookCover { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
