using Core.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.BookFeature
{
    public class Review
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public int Rate { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid ReviewerId { get; set; }
        public Guid BookId { get; set; }
        // 
        public User Reviewer { get; set; }
        public Book Book { get; set; }
        public List<ReviewMedia> ReviewMedias { get; set; }
    }
}
