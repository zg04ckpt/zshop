using Core.DTOs.Auth;
using Data.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public interface IJwtService
    {
        JwtTokenDTO IssueToken(User user, List<string> userRoleNames, bool isLogin);
        ClaimsPrincipal? ValidateAccessToken(string accessToken);
        Task<bool> ValidateRefreshToken(string userId, string refreshToken);
        Task<bool> IsRevokedToken(string accessToken);
        Task RevokeToken(string accessToken);
    }
}
