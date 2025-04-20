using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Book
{
    public class CategoryListItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Thumbnail { get; set; }
        public int? ParentId { get; set; }
        public string? ParentName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
