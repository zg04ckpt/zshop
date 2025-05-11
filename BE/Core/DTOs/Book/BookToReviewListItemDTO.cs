using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Book
{
    public class BookToReviewListItemDTO
    {
        public Guid BookId { get; set; }
        public string BookName { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Cover { get; set; }
    }
}
