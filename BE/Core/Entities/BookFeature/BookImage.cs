using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.BookFeature
{
    public class BookImage
    {
        public int Id { get; set; }
        public Guid BookId { get; set; }
        public string ImageUrl { get; set; }

        // Rela
        public Book Book { get; set; }
    }
}
