using Core.Entities.PaymentFeature;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.BookFeature
{
    public class Book
    {
        public Guid Id { get; set; }
        public string Cover { get; set; }
        public string Name { get; set; }
        public string Author { get; set; }
        public string Language { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public decimal AvgRate { get; set; }
        public string Description { get; set; }
        public int SoldCount { get; set; }
        public int StockCount { get; set; }
        public int PageCount { get; set; }
        public string Publisher { get; set; }
        public int PublishYear { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        // Rela
        public List<Review> Reviews { get; set; }
        public List<BookCategory> BookCategories { get; set; }
        public List<OrderDetail> OrderDetails { get; set; }
        public List<CartItem> CartItems { get; set; }
        public List<BookImage> Images { get; set; }
    }
}
