using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Book
{
    public class BookListItemDTO
    {
        public Guid Id { get; set; }
        public string Cover { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public decimal AvgRate { get; set; }
        public int SoldCount { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string[] Categories { get; set; }
    }
}
