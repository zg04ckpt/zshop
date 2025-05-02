
using Core.Exceptions;
using Core.Interfaces.Services;
using Core.Services;

namespace API.Middlewares
{
    public class JwtCookieMiddleware : IMiddleware
    {
        private readonly IJwtService jwtService;

        public JwtCookieMiddleware(IJwtService jwtService)
        {
            this.jwtService = jwtService;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var accessToken = context.Request.Cookies["AccessToken"];
            if (!string.IsNullOrEmpty(accessToken))
            {
                if (await jwtService.IsRevokedToken(accessToken))
                    throw new UnauthorizedException("Access token không hợp lệ");
                context.Request.Headers.Append("Authorization", "Bearer " + accessToken);
            }

            await next(context);
        }
    }
}
