namespace Core.Utilities
{
    public class EnvHelper
    {
        private static string GetRequiredVar(string variableName)
        {
            var value = Environment.GetEnvironmentVariable(variableName);
            if (string.IsNullOrEmpty(value))
            {
                throw new InvalidOperationException($"Environment variable '{variableName}' is not set.");
            }
            return value;
        }

        public static string GetMySQLConnectionString()
        {
            return GetRequiredVar("ZShopMySQLConnectionString");
        }

        public static string GetRedisConnectionString()
        {
            return GetRequiredVar("ZShopRedisConnectionString");
        }

        public static string GetGoogleClientId()
        {
            return GetRequiredVar("GoogleClientId");
        }

        public static string GetGoogleClientSecret()
        {
            return GetRequiredVar("GoogleClientSecret");
        }

        public static string GetVNpayHashSecret() 
        {
            return GetRequiredVar("ZShopVNPayHashSecret");
        }

        public static string GetCloudinaryCloundName()
        {
            return GetRequiredVar("ZShopCloudinaryCloundName");
        }

        public static string GetCloudinaryApiKey()
        {
            return GetRequiredVar("ZShopCloudinaryApiKey");
        }

        public static string GetCloudinaryApiSecret()
        {
            return GetRequiredVar("ZShopCloudinaryApiSecret");
        }

        public static string GetSystemEmail()
        {
            return GetRequiredVar("SystemEmailAddress");
        }

        public static string GetSystemEmailPassword()
        {
            return GetRequiredVar("SystemEmailPassword");
        }

        public static string GetSecretKey()
        {
            return GetRequiredVar("SecretKey");
        }

        public static string GetAdminUserName()
        {
            return GetRequiredVar("AdminUserName");
        }
        
        public static string GetAdminEmail()
        {
            return GetRequiredVar("AdminEmail");
        }

        public static string GetAdminPassword()
        {
            return GetRequiredVar("AdminPassword");
        }

        // --- RAG AI & Qdrant Configs ---
        public static string GetRagApiKey()
        {
            return GetRequiredVar("RagApiKey");
        }

        public static string GetRagEndpoint()
        {
            return GetRequiredVar("RagEndpoint");
        }

        public static string GetQdrantHost()
        {
            return GetRequiredVar("QdrantHost");
        }

        public static int GetQdrantPort()
        {
            return int.Parse(GetRequiredVar("QdrantPort"));
        }
    }
}
