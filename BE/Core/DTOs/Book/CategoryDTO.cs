using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Book
{
    public class CategoryDTO
    {
        [Required(ErrorMessage = "Tên danh mục trống.")]
        public string Name { get; set; }
        public IFormFile? Thumbnail { get; set; }
        public int? ParentId { get; set; }
    }
}
