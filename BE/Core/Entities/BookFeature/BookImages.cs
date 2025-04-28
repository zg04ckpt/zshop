using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.BookFeature
{
    public class BookImages
    {
        public int Id { get; set; }
        public Guid BookId { get; set; }
        public string MyProperty { get; set; }
    }
}
