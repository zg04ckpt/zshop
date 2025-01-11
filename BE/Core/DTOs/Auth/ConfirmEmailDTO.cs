using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Auth
{
    public class ConfirmEmailDTO
    {
        [Required(ErrorMessage = "ID người dùng không được bỏ trống")]
        public string UserId { get; set; }

        [Required(ErrorMessage = "Mã xác thực không được bỏ trống")]
        [RegularExpression("^[0-9]{6}$", ErrorMessage = "Mã xác thực dài 6 kí tự và chỉ chứa số")]
        public string Code { get; set; }
    }
}
