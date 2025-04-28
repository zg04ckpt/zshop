using Core.DTOs.Common;
using Core.Exceptions;
using Newtonsoft.Json;

namespace API.Middlewares
{
    public class ExceptionMiddleware : IMiddleware
    {
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(ILogger<ExceptionMiddleware> logger)
        {
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                await HandleException(ex, context);
            }
        }

        private async Task HandleException(Exception ex, HttpContext context)
        {
            if (ex is BadRequestException)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync(JsonConvert.SerializeObject(new ApiErrorResult(ex)));
            }   
            else if(ex is UnauthorizedException)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync(JsonConvert.SerializeObject(new ApiErrorResult(ex)));
            }
            else if (ex is InternalServerErrorException)
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsync(JsonConvert.SerializeObject(new ApiErrorResult(ex)));
            }
            else if (ex is LockedException)
            {
                context.Response.StatusCode = StatusCodes.Status423Locked;
                await context.Response.WriteAsync(JsonConvert.SerializeObject(new ApiErrorResult(ex)));
            }
            else
            {
                _logger.LogError(ex, "An unexpected error occurred.");
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsync(JsonConvert.SerializeObject(new ApiErrorResult("Lỗi không xác định")));
            }
        }
    }
}
