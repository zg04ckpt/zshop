using Core.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Book
{
    public class BookSearchDTO : BasePaging
    {
        public string? Name { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string SortBy { get; set; } = "Name";
        public string Order { get; set; } = "asc";
        public int[] CategoryIds { get; set; } = Array.Empty<int>();
    }
}
