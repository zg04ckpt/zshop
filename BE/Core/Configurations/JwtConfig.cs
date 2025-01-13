using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Configurations
{
    public class JwtConfig
    {
        public string Audience { get; set; }
        public string Issuer { get; set; }
        public int AccessTokenTTL { get; set; } // min
        public int RefreshTokenTTL { get; set; } // min
    }
}
