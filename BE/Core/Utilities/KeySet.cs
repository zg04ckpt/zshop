using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Utilities
{
    public class KeySet
    {
        public class RedisType
        {
            public const string LOGIN_LOCKED = "login_locked_flag";
            public const string RESET_PASS = "reset_pass_auth_code";
            public const string CONFIRM_EMAIL = "authentication_email_code";
            public const string REFRESH_TOKEN = "valid_refresh_token";
            public const string REVOKED_ACCESS_TOKEN = "revoked_access_token";
        }
    }
}
