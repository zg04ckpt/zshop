using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Auth
{
    public class ResetPasswordDTO
    {
        [Required(ErrorMessage = "Email không được trống.")]
        [EmailAddress(ErrorMessage = "Sai định dạng email.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Vui lòng điền mật khẩu.")]
        [RegularExpression("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!.#@$-]{8,16}$", 
            ErrorMessage = "Mật khẩu phải chứa chữ cái in thường, in hoa, chữ số và dài từ 8-16 kí tự, có thể chứa kí tự đặc biệt (!.#@$-)")]

        public string Password { get; set; }

        [Required(ErrorMessage = "Vui lòng điền mật khẩu xác nhận.")]
        [Compare("Password", ErrorMessage = "Mật khẩu xác nhận không đúng.")]
        public string ConfirmPassword { get; set; }

        [Required(ErrorMessage = "Mã xác thực không được bỏ trống")]
        [RegularExpression("^[0-9]{6}$", ErrorMessage = "Mã xác thực dài 6 kí tự và chỉ chứa số")]
        public string Code { get; set; }

    }
}
