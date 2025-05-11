using Core.DTOs.Auth;
using Core.DTOs.Common;
using Microsoft.AspNetCore.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface IAuthService
    {
        Task<ApiResult> Register(RegisterDTO data);
        Task<LoginResponseDTO> LogIn(LoginDTO data);
        Task<JwtTokenDTO> GoogleLogIn(AuthenticateResult? data);
        Task<ApiResult<UserDTO>> GetLoginInfo(ClaimsPrincipal claims);
        Task<ApiResult> LogOut(string? accessToken);
        Task<ApiResult> ResendConfirmEmailCode(string email);
        Task<ApiResult> ConfirmEmailByCode(ConfirmEmailDTO data);
        Task<JwtTokenDTO> RefreshToken(string accessToken, string refreshToken);
        Task<ApiResult> SendResetPassAuthCode(string email);
        Task<ApiResult> RefreshPassword(ResetPasswordDTO data);
    }
}
