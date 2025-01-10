using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Auth
{
    public class JwtTokenDTO
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string Type { get; set; }
        public DateTime ExpireAt { get; set; }
    }
}
