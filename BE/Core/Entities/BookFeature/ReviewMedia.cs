using Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.BookFeature
{
    public class ReviewMedia
    {
        public int Id { get; set; }
        public string SourceUrl { get; set; }
        public MediaType MediaType { get; set; }
        public int? Duration { get; set; }
        //
        public Guid ReviewId { get; set; }
        public Review Review { get; set; }
    }
}
// 