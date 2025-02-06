
namespace API.Middlewares
{
    public class ValidationMiddleware : IMiddleware
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            context.Response.OnStarting(() =>
            {
                if (context.Response.StatusCode == 400 && context.Items["ModelStateErrors"] is string errors)
                {
                    context.Response.ContentType = "application/json";
                    return context.Response.WriteAsync(errors);
                }

                return Task.CompletedTask;
            });

            await next(context);
        }
    }
}
