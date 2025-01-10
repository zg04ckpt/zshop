using Core.DTOs.Auth;
using Data.Entities.System;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services.Impl
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration config;

        public JwtService(IConfiguration config)
        {
            this.config = config;
        }

        public JwtTokenDTO IssueToken(User user, List<string> userRoleNames)
        {
            // Prepare claims
            List<Claim> claims = new()
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString())
            };
            userRoleNames.ForEach(e => claims.Add(new(ClaimTypes.Role, e)));

            // Prepare token key from secret key
            byte[] bytes = Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("SecretKey")!);
            SymmetricSecurityKey tokenKey = new(bytes);

            // Expiration time
            DateTime expireAt = DateTime.Now.AddMinutes(double.Parse(config.GetSection("JwtConfig")["AccessTokenTTL"]));

            // Gen new access token & refresh token
            JwtSecurityToken token = new
            (
                issuer: config.GetSection("JwtConfig")["Issuer"],
                audience: config.GetSection("JwtConfig")["Audience"],
                signingCredentials: new SigningCredentials(tokenKey, SecurityAlgorithms.HmacSha256),
                claims: claims,
                expires: expireAt
            );
            string accessToken = new JwtSecurityTokenHandler().WriteToken(token);
            string refreshToken = GenerateRefreshToken();

            return new JwtTokenDTO
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Type = "Bearer",
                ExpireAt = expireAt
            };
        }

        private string GenerateRefreshToken()
        {
            // Gen a random 32 chars string
            byte[] bytes = new byte[32]; 
            using var random = RandomNumberGenerator.Create();
            random.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        public Task<JwtTokenDTO> RefreshToken(string accessToken, string refreshToken)
        {
            throw new NotImplementedException();
        }

        public Task RevokeToken(string accessToken, string refreshToken)
        {
            throw new NotImplementedException();
        }
    }
}
