using Newtonsoft.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Core.Utilities
{
    public class Helper
    {
        public static DateTime ConvertFromUtcToLocalTime(DateTime dateTime)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(dateTime, TimeZoneInfo.Local);
        }
        public static string ToJsonString(object data) => JsonConvert.SerializeObject(data);

        public static string HashPassword(string password)
        {
            using var hasher = new HMACSHA256(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("SecretKey")!));
            byte[] bytes = hasher.ComputeHash(Encoding.UTF8.GetBytes(password));
            StringBuilder sb = new ();
            foreach (byte b in bytes)
            {
                sb.Append(b.ToString("x2"));
            }
            return sb.ToString();
        }

        public static string GenerateRandomToken(string src, int len)
        {
            Random random = new ();
            StringBuilder sb = new ();
            for (int i = 0; i < len; i++)
            {
                sb.Append(src[random.Next(src.Length)]);
            }
            return sb.ToString();
        }

        public static string? GetUserIdFromClaims(ClaimsPrincipal claims)
        {
            return claims.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        public static string ConvertToValidPropName(string propName)
        {
            return char.ToUpperInvariant(propName[0]) + propName[1..];
        }

        public static string GetDefaultImageUrl()
        {
            return "https://res.cloudinary.com/dvk5yt0oi/image/upload/v1744160122/empty_curqqs.jpg";
        }
    
        public static bool CheckRoleFromClaims(string roleName, ClaimsPrincipal claims)
        {
            return claims.Claims.Any(e => e.Type == ClaimTypes.Role && e.Value == roleName);
        }
    }
}
