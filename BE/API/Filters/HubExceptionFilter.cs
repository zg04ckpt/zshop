using Microsoft.AspNetCore.SignalR;

namespace API.Filters
{
    public class HubExceptionFilter : IHubFilter
    {
        private readonly ILogger<HubExceptionFilter> _logger;

        public HubExceptionFilter(ILogger<HubExceptionFilter> logger)
        {
            _logger = logger;
        }

        public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext context,
        Func<HubInvocationContext, ValueTask<object?>> next)
        {
            try
            {
                return await next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "SignalR error. Hub={Hub} Method={Method} Conn={ConnId}",
                    context.Hub.GetType().Name,
                    context.HubMethodName,
                    context.Context.ConnectionId);

                // Trả lỗi chuẩn về client
                throw new HubException("SERVER_ERROR");
            }
        }

        public async Task OnConnectedAsync(
            HubLifetimeContext context,
            Func<HubLifetimeContext, Task> next)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SignalR connect failed {ConnId}", context.Context.ConnectionId);
                throw;
            }
        }

        public async Task OnDisconnectedAsync(
            HubLifetimeContext context,
            Exception? exception,
            Func<HubLifetimeContext, Exception?, Task> next)
        {
            try
            {
                await next(context, exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SignalR disconnect error {ConnId}", context.Context.ConnectionId);
            }
        }
    }
}
