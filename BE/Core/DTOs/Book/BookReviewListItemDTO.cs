using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Book
{
    public class BookReviewListItemDTO
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string UserAvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int Rate { get; set; }
        public string Content { get; set; }
        public string[] ImageUrls { get; set; }
    }
}
