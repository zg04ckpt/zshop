﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Auth
{
    public class GoogleLoginResponseDTO : LoginResponseDTO
    {
        public string ReturnUrl { get; set; }
    }
}
