using Core.Configurations;
using Core.DTOs.Auth;
using Core.DTOs.Common;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace API.Controllers.v1
{
    [Route("api/v1/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;
        private readonly JwtConfig _jwtConfig;

        public AuthController(IOptions<JwtConfig> config, IAuthService authService)
        {
            this.authService = authService;
            _jwtConfig = config.Value;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterNewUser([FromBody] RegisterDTO data)
        {
            return Ok(await authService.Register(data));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO data)
        {
            var result = await authService.LogIn(data);
            SetAuthCookie(result.Token);
            return Ok(new ApiSuccessResult<UserDTO>(result.User));
        }

        [HttpGet("login/info")]
        public async Task<IActionResult> GetLoginInfo()
        {
            if (!Request.Headers.ContainsKey("Authorization") 
                || string.IsNullOrEmpty(Request.Headers["Authorization"]))
            {
                return BadRequest(new ApiErrorResult("Người dùng chưa đăng nhập"));
            }
            return Ok(await authService.GetLoginInfo(User));
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var accessToken = Request.Cookies["AccessToken"];
            var refreshToken = Request.Cookies["RefreshToken"];
            if (accessToken == null && refreshToken == null)
            {
                return Unauthorized();
            }
            var token = await authService.RefreshToken(accessToken!, refreshToken!);
            SetAuthCookie(token);
            return Ok(new ApiSuccessResult());
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var accessToken = Request.Cookies["AccessToken"];
            if (accessToken != null)
            {
                Response.Cookies.Delete("AccessToken");
                Response.Cookies.Delete("RefreshToken");
            }
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
            var token = await authService.GoogleLogIn(authenticateResult);
            SetAuthCookie(token);
            return Redirect(returnUrl);
        }
    
        private void SetAuthCookie(JwtTokenDTO token)
        {
            var accessTokenCookieOptions = new CookieOptions
            {
                Path = "/",
                HttpOnly = true,
                SameSite = SameSiteMode.None,
                Secure = true,
                // Set longer time to get expired access token
                MaxAge = TimeSpan.FromMinutes(_jwtConfig.RefreshTokenTTL)
            };
            Response.Cookies.Append("AccessToken", token.AccessToken, accessTokenCookieOptions);

            var refreshTokenCookieOptions = new CookieOptions
            {
                Path = "/api/v1/auth/refresh",
                HttpOnly = true,
                SameSite = SameSiteMode.None,
                Secure = true,
                MaxAge = TimeSpan.FromMinutes(_jwtConfig.RefreshTokenTTL)
            };
            Response.Cookies.Append("RefreshToken", token.RefreshToken, refreshTokenCookieOptions);
        }
    }
}
