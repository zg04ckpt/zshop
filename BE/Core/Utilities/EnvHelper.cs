using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Utilities
{
    public class EnvHelper
    {
        public static string GetSystemEmail()
        {
            return Environment.GetEnvironmentVariable("SystemEmailAddress")!;
        }

        public static string GetSystemEmailPassword()
        {
            return Environment.GetEnvironmentVariable("SystemEmailPassword")!;
        }

        public static string GetSecretKey()
        {
            return Environment.GetEnvironmentVariable("SecretKey")!;
        }

        public static string GetAdminUserName()
        {
            return Environment.GetEnvironmentVariable("AdminUserName")!;
        }
        
        public static string GetAdminEmail()
        {
            return Environment.GetEnvironmentVariable("AdminEmail")!;
        }

        public static string GetAdminPassword()
        {
            return Environment.GetEnvironmentVariable("AdminPassword")!;
        }
    }
}
