using Core.DTOs.Auth;
using Data.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public interface IJwtService
    {
        JwtTokenDTO IssueToken(User user, List<string> userRoleNames);
        Task<JwtTokenDTO> RefreshToken(string accessToken, string refreshToken);
        Task RevokeToken(string accessToken, string refreshToken);
    }
}
