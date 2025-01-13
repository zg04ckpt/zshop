using Core.DTOs.Auth;
using Core.DTOs.Common;
using Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v1/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService authService)
        {
            this.authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterNewUser([FromBody] RegisterDTO data)
        {
            return Ok(await authService.Register(data));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO data)
        {
            return Ok(await authService.LogIn(data));
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Login([FromBody] TokenDTO data)
        {
            return Ok(await authService.RefreshToken(data));
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var accessToken = Request.Headers.Authorization.ToString().Replace($"Bearer ", "");
            return Ok(await authService.LogOut(accessToken));
        }

        [HttpPost("resend-confirm-mail-auth-code")]
        public async Task<IActionResult> ResendConfirmEmailAuthenticationCode([FromBody] ResendEmailAuthCodeDTO data)
        {
            return Ok(await authService.ResendConfirmEmailCode(data.UserId));
        }

        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDTO data)
        {
            return Ok(await authService.ValidateEmailByCode(data));
        }

        [HttpPost("send-reset-pass-auth-code")]
        public async Task<IActionResult> SendResetPassAuthenticationCode([FromBody] SendResetPassAuthCodeDTO data)
        {
            return Ok(await authService.SendResetPassAuthCode(data.Email));
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO data)
        {
            return Ok(await authService.RefreshPassword(data));
        }
    }
}
