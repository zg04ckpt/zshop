using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Book
{
    public class BookDTO
    {
        public IFormFile? Cover { get; set; }

        [Required(ErrorMessage = "Tên không được bỏ trống")]
        public string Name { get; set; }


        [Required(ErrorMessage = "Tác giả không được bỏ trống")]
        public string Author { get; set; }


        [Required(ErrorMessage = "Năm xuất bản không được bỏ trống")]
        public int PublishYear { get; set; }


        [Required(ErrorMessage = "Nhà xuất bản không được bỏ trống")]
        public string Publisher { get; set; }


        [Required(ErrorMessage = "Số trang không được bỏ trống")]
        public int PageCount { get; set; }


        [Required(ErrorMessage = "Ngôn ngữ không được bỏ trống")]
        public string Language { get; set; }


        [Required(ErrorMessage = "Giá không được bỏ trống")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Số lượng không được bỏ trống")]
        public int Stock { get; set; }

        [Required(ErrorMessage = "Mô tả không được bỏ trống")]
        public string Description { get; set; }
        public int[] CategoryIds { get; set; } = Array.Empty<int>();

        [Required(ErrorMessage = "Vui lòng thêm ảnh minh họa")]
        public List<CreateOrUpdateBookImageListItemDTO> Images { get; set; }
    }
}
