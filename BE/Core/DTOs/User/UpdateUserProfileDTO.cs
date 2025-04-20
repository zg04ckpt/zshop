using Core.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Core.DTOs.User
{
    public class UpdateUserProfileDTO
    {
        [Required(ErrorMessage = "Vui lòng điền họ đệm.")]
        [MaxLength(50, ErrorMessage = "Họ đệm dài tối đa {0} kí tự.")]
        public string LastName { get; set; }


        [Required(ErrorMessage = "Vui lòng điền tên.")]
        [MaxLength(50, ErrorMessage = "Tên dài tối đa {0} kí tự.")]
        public string FirstName { get; set; }


        [Required(ErrorMessage = "Vui lòng điền email.")]
        [RegularExpression("^[a-zA-Z0-9._]+@[a-zA-Z0-9.]+\\.[a-zA-Z]{2,4}$", ErrorMessage = "Sai định dạng email.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Vui lòng điền số điện thoại.")]
        [Phone(ErrorMessage = "Không đúng định dạng số điện thoại.")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Giới tính không được bỏ trống.")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Gender Gender { get; set; }

        public DateTime? DateOfBirth { get; set; }
        public IFormFile? NewAvatar { get; set; }
    }
}
