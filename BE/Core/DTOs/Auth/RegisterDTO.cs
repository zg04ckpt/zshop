﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Auth
{
    public class RegisterDTO
    {
        [Required(ErrorMessage = "Vui lòng điền tên.")]
        [MaxLength(50, ErrorMessage = "Tên dài tối đa {0} kí tự.")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Vui lòng điền họ đệm.")]
        [MaxLength(50, ErrorMessage = "Họ đệm dài tối đa {0} kí tự.")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Vui lòng điền tên tài khoản.")]
        [RegularExpression("^[a-zA-Z0-9]{4,16}$", 
            ErrorMessage = "Tên người dùng chỉ được chứa chữ cái (không dấu), chữ số và dài 4-16 kí tự.")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Vui lòng điền email.")]
        [RegularExpression("^[a-zA-Z0-9._]+@[a-zA-Z0-9.]+\\.[a-zA-Z]{2,4}$", ErrorMessage = "Sai định dạng email.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Vui lòng điền số điện thoại.")]
        [Phone(ErrorMessage = "Không đúng định dạng số điện thoại.")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Vui lòng điền mật khẩu.")]
        [RegularExpression("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!.#@$-]{8,16}$", 
            ErrorMessage = "Mật khẩu phải chứa chữ cái in thường, in hoa, chữ số và dài từ 8-16 kí tự, có thể chứa kí tự đặc biệt (!.#@$-)")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Vui lòng điền mật khẩu xác nhận.")]
        [Compare("Password", ErrorMessage = "Mật khẩu xác nhận không đúng.")]
        public string ConfirmPassword { get; set; }
    }
}
