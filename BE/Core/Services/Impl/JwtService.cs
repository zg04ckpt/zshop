using Core.Configurations;
using Core.DTOs.Auth;
using Core.Utilities;
using Data.Entities.System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
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
        private readonly IRedisService redisService;
        private readonly JwtConfig jwtConfig;

        public JwtService(IOptions<JwtConfig> config, IRedisService redisService)
        {
            this.jwtConfig = config.Value;
            this.redisService = redisService;
        }

        public JwtTokenDTO IssueToken(User user, List<string> userRoleNames, bool isLogin)
        {
            // Prepare claims
            List<Claim> claims = new()
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString())
            };
            userRoleNames.ForEach(e => claims.Add(new(ClaimTypes.Role, e)));

            // Prepare token key from secret key
            byte[] bytes = Encoding.UTF8.GetBytes(EnvHelper.GetSecretKey());
            SymmetricSecurityKey tokenKey = new(bytes);

            // Expiration time
            DateTime expireAt = DateTime.Now.AddMinutes(jwtConfig.AccessTokenTTL);

            // Gen new access token & refresh token
            JwtSecurityToken token = new
            (
                issuer: jwtConfig.Issuer,
                audience: jwtConfig.Audience,
                signingCredentials: new SigningCredentials(tokenKey, SecurityAlgorithms.HmacSha256),
                claims: claims,
                expires: expireAt
            );
            string accessToken = new JwtSecurityTokenHandler().WriteToken(token);
            
            // Create new refresh token, if this is login => save refresh token to redis
            string refreshToken = GenerateRefreshToken();
            if (isLogin)
            {
                redisService.Set(
                    KeySet.RedisType.REFRESH_TOKEN,
                    user.Id.ToString(), 
                    refreshToken, 
                    TimeSpan.FromMinutes(jwtConfig.RefreshTokenTTL));
            }
            else
            {
                // If this is refresh access token => update new refresh token
                redisService.UpdateAndKeepTTL(KeySet.RedisType.REFRESH_TOKEN, user.Id.ToString(), refreshToken);
            }    

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

        public ClaimsPrincipal? ValidateAccessToken(string accessToken)
        {
            // Prepare params to validate expired accesstoken 
            byte[] bytes = Encoding.UTF8.GetBytes(EnvHelper.GetSecretKey());
            SymmetricSecurityKey key = new(bytes);
            TokenValidationParameters param = new()
            {
                ValidateIssuer = true,
                ValidIssuer = jwtConfig.Issuer,

                ValidateAudience = true,
                ValidAudience = jwtConfig.Audience,

                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,

                ValidateLifetime = false
            };

            // Validate
            try
            {
                ClaimsPrincipal claim = new JwtSecurityTokenHandler().ValidateToken(accessToken, param, out SecurityToken validatedToken);
                JwtSecurityToken? token = validatedToken as JwtSecurityToken;
                if (token is null || token.Header.Alg.ToLower() != SecurityAlgorithms.HmacSha256.ToLower())
                    return null;
                return claim;
            }
            catch
            {
                return null;
            }
        }

        public async Task RevokeToken(string accessToken)
        {
            // save access token to backlist
            await redisService.Set(
                KeySet.RedisType.REVOKED_ACCESS_TOKEN,
                accessToken, "-", 
                TimeSpan.FromMinutes(jwtConfig.AccessTokenTTL));

            // remove refresh token to free up memory
            ClaimsPrincipal claim = ValidateAccessToken(accessToken)!;
            await redisService.Delete(KeySet.RedisType.REFRESH_TOKEN, claim.FindFirstValue(ClaimTypes.NameIdentifier));
        }

        public async Task<bool> ValidateRefreshToken(string userId, string refreshToken)
        {
            string? token = await redisService.Get(KeySet.RedisType.REFRESH_TOKEN, userId);
            if (token is null ||  !token.Equals(refreshToken))
                return false;
            return true;
        }

        public async Task<bool> IsRevokedToken(string accessToken)
        {
            return await redisService.IsExists(KeySet.RedisType.REVOKED_ACCESS_TOKEN, accessToken);
        }
    }
}
