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
        Task<ApiResult<RegisterResponseDTO>> Register(RegisterDTO data);
        Task<ApiResult<LoginResponseDTO>> LogIn(LoginDTO data);
        Task<ApiResult> LogOut(string accessToken);
        Task<ApiResult> ResendConfirmEmailCode(string userId);
        Task<ApiResult> ValidateEmailByCode(ConfirmEmailDTO data);
        Task<ApiResult<JwtTokenDTO>> RefreshToken(TokenDTO data);
        Task<ApiResult> SendResetPassAuthCode(string email);
        Task<ApiResult> RefreshPassword(ResetPasswordDTO data);
    }
}
