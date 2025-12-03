
using Core.Exceptions;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;

namespace API.Middlewares
{
    public class JwtMiddleware : IMiddleware
    {
        private readonly IJwtService jwtService;
        private readonly IConfiguration configuration;

        public JwtMiddleware(IJwtService jwtService, IConfiguration configuration)
        {
            this.jwtService = jwtService;
            this.configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            // Chỉ kiểm tra access token bị thu hồi với các api cần Authorize
            if (context.GetEndpoint()?.Metadata?.GetMetadata<AuthorizeAttribute>() == null)
            {
                await next(context);
                return;
            }

            var authorization = context.Request.Headers.Authorization;
            if (!string.IsNullOrEmpty(authorization))
            {
                string accessToken = authorization.ToString().Replace($"Bearer ", "");
                if (await jwtService.IsRevokedToken(accessToken))
                    throw new UnauthorizedException("Access token không hợp lệ");
            }
            await next(context);
        }
    }
}
