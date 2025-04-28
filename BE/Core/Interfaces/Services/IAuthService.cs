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
        Task<ApiResult<LoginResponseDTO>> LogIn(LoginDTO data);
        Task<string> GoogleLogIn(AuthenticateResult? data);
        Task<ApiResult<LoginResponseDTO>> GetGoogleLoginTempData(string key);
        Task<ApiResult> LogOut(string accessToken);
        Task<ApiResult> ResendConfirmEmailCode(string email);
        Task<ApiResult> ConfirmEmailByCode(ConfirmEmailDTO data);
        Task<ApiResult<JwtTokenDTO>> RefreshToken(TokenDTO data);
        Task<ApiResult> SendResetPassAuthCode(string email);
        Task<ApiResult> RefreshPassword(ResetPasswordDTO data);
    }
}
