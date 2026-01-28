using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Book
{
    public class CreateBookReviewDTO
    {
        [Required(ErrorMessage = "{0} không thể bỏ trống")]
        public Guid BookId { get; set; }

        [Required(ErrorMessage = "{0} không thể bỏ trống")]
        public string Content { get; set; }

        [Required(ErrorMessage = "{0} không thể bỏ trống")]
        public List<IFormFile> Images { get; set; }

        [Required(ErrorMessage = "{0} không thể bỏ trống")]
        public int Rate { get; set; }
    }
}
