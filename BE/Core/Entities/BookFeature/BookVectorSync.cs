using System;
using System.ComponentModel.DataAnnotations;

namespace Core.Entities.BookFeature
{
    public class BookVectorSync
    {
        [Key]
        public Guid BookId { get; set; }
        
        public DateTime LastSyncedAt { get; set; }
        
        public string? ErrorMessage { get; set; }

        [global::System.ComponentModel.DataAnnotations.Schema.ForeignKey("BookId")]
        public Book Book { get; set; } = null!;
    }
}
