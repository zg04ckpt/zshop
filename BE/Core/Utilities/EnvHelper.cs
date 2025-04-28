namespace Core.Utilities
{
    public class EnvHelper
    {
        public static string GetGoogleClientId()
        {
            return Environment.GetEnvironmentVariable("GoogleClientId")!;
        }

        public static string GetGoogleClientSecret()
        {
            return Environment.GetEnvironmentVariable("GoogleClientSecret")!;
        }

        public static string GetVNpayHashSecret() 
        {
            return Environment.GetEnvironmentVariable("ZShopVNPayHashSecret")!;
        }
        public static string GetCloudinaryCloundName()
        {
            return Environment.GetEnvironmentVariable("ZShopCloudinaryCloundName")!;
        }

        public static string GetCloudinaryApiKey()
        {
            return Environment.GetEnvironmentVariable("ZShopCloudinaryApiKey")!;
        }

        public static string GetCloudinaryApiSecret()
        {
            return Environment.GetEnvironmentVariable("ZShopCloudinaryApiSecret")!;
        }

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
