using Core.DTOs.Auth;
using Core.DTOs.Common;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
        public async Task<IActionResult> RefreshToken([FromBody] TokenDTO data)
        {
            return Ok(await authService.RefreshToken(data));
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var accessToken = Request.Headers.Authorization.ToString().Replace($"Bearer ", "");
            return Ok(await authService.LogOut(accessToken));
        }

        [HttpPost("resend-confirm-mail-auth-code")]
        public async Task<IActionResult> ResendConfirmEmailAuthenticationCode([FromBody] ResendEmailAuthCodeDTO data)
        {
            return Ok(await authService.ResendConfirmEmailCode(data.Email));
        }

        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDTO data)
        {
            return Ok(await authService.ConfirmEmailByCode(data));
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

        [HttpGet("google/login")]
        public IActionResult GoogleLogin([FromQuery] string returnUrl)
        {
            var props = new AuthenticationProperties
            {
                RedirectUri = Url.Action(nameof(GoogleLoginCallback), new
                {
                    returnUrl
                }),
                Items =
                {
                    { "prompt", "select_account" }
                }
            };
            return Challenge(props, "Google");
        }


        [HttpGet("google/login/callback")]
        public async Task<IActionResult> GoogleLoginCallback([FromQuery] string returnUrl)
        {
            var authenticateResult = await HttpContext.AuthenticateAsync("Google");
            string tempDataKey = await authService.GoogleLogIn(authenticateResult);

            // Return a cookie used to get auth info later
            Response.Cookies.Append("GoogleLoginResult", tempDataKey, new CookieOptions
            {
                Secure = true,
                SameSite = SameSiteMode.None,
                HttpOnly = true     
            });
                
            return Redirect(returnUrl);
        }


        [HttpGet("google/login/result")]
        public async Task<IActionResult> GetGoogleLoginResult()
        {
            string? tempDataKey = Request.Cookies["GoogleLoginResult"];
            if (tempDataKey is null)
            {
                return Unauthorized();
            }
            Response.Cookies.Delete("GoogleLoginResult");
            return Ok(await authService.GetGoogleLoginTempData(tempDataKey));
        }
    }
}
