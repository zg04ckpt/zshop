using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Auth
{
    public class LoginResponseDTO
    {
        public UserDTO User { get; set; }
        public JwtTokenDTO Token { get; set; }
    }
}
