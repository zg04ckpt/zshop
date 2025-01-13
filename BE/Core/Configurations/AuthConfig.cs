using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Configurations
{
    public class AuthConfig
    {
        public int MaxFailedAttempts { get; set; }
        public int ConfirmEmailAuthCodeTTL { get; set; }
        public int ResetPassAuthCodeTTL { get; set; }
        public int LoginLockFlagTTL { get; set; }
    }
}
