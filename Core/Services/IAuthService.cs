using Core.DTOs.Auth;
using Core.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services
{
    public interface IAuthService
    {
        Task<ApiResult> Register(RegisterDTO data);
        Task<ApiResult<LoginResponseDTO>> LogIn(LoginDTO data);
        Task<ApiResult> LogOut(ClaimsPrincipal claims);
        Task<ApiResult> ConfirmEmail(string userId, string token);
        Task<ApiResult<JwtTokenDTO>> RefreshAccessToken(string accessToken, string refreshToken);
    }
}
