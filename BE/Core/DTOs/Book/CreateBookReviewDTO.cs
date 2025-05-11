using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
