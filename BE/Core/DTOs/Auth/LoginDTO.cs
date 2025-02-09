using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Auth
{
    public class LoginDTO
    {
        [Required(ErrorMessage = "Vui lòng điền email.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Vui lòng điền mật khẩu.")]
        public string Password { get; set; }
    }
}
