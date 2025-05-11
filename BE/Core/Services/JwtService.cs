using Core.Configurations;
using Core.DTOs.Auth;
using Core.Utilities;
using Core.Entities.System;
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
using Core.Interfaces.Services;

namespace Core.Services
{
    public class JwtService : IJwtService
    {
        private readonly IRedisService _redisService;
        private readonly JwtConfig _jwtConfig;

        public JwtService(IOptions<JwtConfig> config, IRedisService redisService)
        {
            _jwtConfig = config.Value;
            _redisService = redisService;
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
            DateTime expireAt = DateTime.Now.AddMinutes(_jwtConfig.AccessTokenTTL);

            // Gen new access token & refresh token
            JwtSecurityToken token = new
            (
                issuer: _jwtConfig.Issuer,
                audience: _jwtConfig.Audience,
                signingCredentials: new SigningCredentials(tokenKey, SecurityAlgorithms.HmacSha256),
                claims: claims,
                expires: expireAt
            );
            string accessToken = new JwtSecurityTokenHandler().WriteToken(token);

            // Create new refresh token, if this is login => save refresh token to _redis
            string refreshToken = GenerateRefreshToken();
            if (isLogin)
            {
                _redisService.Set(
                    KeySet.RedisType.REFRESH_TOKEN,
                    user.Id.ToString(),
                    refreshToken,
                    TimeSpan.FromMinutes(_jwtConfig.RefreshTokenTTL));
            }
            else
            {
                // If this is refresh access token => update new refresh token
                _redisService.UpdateAndKeepTTL(KeySet.RedisType.REFRESH_TOKEN, user.Id.ToString(), refreshToken);
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
                ValidIssuer = _jwtConfig.Issuer,

                ValidateAudience = true,
                ValidAudience = _jwtConfig.Audience,

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
            await _redisService.Set(
                KeySet.RedisType.REVOKED_ACCESS_TOKEN,
                accessToken, "-",
                TimeSpan.FromMinutes(_jwtConfig.AccessTokenTTL));

            // remove refresh token to free up memory
            ClaimsPrincipal claim = ValidateAccessToken(accessToken)!;
            await _redisService.Delete(KeySet.RedisType.REFRESH_TOKEN, claim.FindFirstValue(ClaimTypes.NameIdentifier));
        }

        public async Task<bool> ValidateRefreshToken(string userId, string refreshToken)
        {
            string? token = await _redisService.Get(KeySet.RedisType.REFRESH_TOKEN, userId);
            if (token is null || !token.Equals(refreshToken))
                return false;
            return true;
        }

        public async Task<bool> IsRevokedToken(string accessToken)
        {
            return await _redisService.IsExists(KeySet.RedisType.REVOKED_ACCESS_TOKEN, accessToken);
        }
    }
}
