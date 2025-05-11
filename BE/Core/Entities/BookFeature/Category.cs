using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.BookFeature
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Thumbnail { get; set; }
        public int? ParentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        //
        public Category? Parent { get; set; }
        public List<Category> Children { get; set; }
        public List<BookCategory> BookCategories { get; set; }
    }
}
