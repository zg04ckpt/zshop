using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Core.Utilities
{
    public class Helper
    {
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
    }
}
