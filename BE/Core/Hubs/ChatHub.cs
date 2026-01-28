using Core.Entities.ChatFeature;
using Core.Interfaces.Services;
using Core.Services;
using Core.Utilities;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Core.Hubs
{
    public class ChatHub : Hub
    {
        public const string URL = "/hubs/chat";
        private readonly IChatService _chatService;
        private readonly ChatConnnectionStoreService _store;
        private readonly ILogger<ChatHub> _logger;

        public class MethodNames
        {
            public const string OnReceivedMessage = nameof(OnReceivedMessage);
            public const string OnClientOnline = nameof(OnClientOnline);
            public const string OnAdminOnline = nameof(OnAdminOnline);
            public const string OnAdminReceivedListOnlineConversations = nameof(OnAdminReceivedListOnlineConversations);
        }

        public ChatHub(
            IChatService chatService,
            ChatConnnectionStoreService store,
            ILogger<ChatHub> logger)
        {
            _chatService = chatService;
            _store = store;
            _logger = logger;
        }

        public async Task OnClientSendMessage(string content)
        {
            var conversationId = Context.GetHttpContext()?.Request?.Cookies["ConversationId"];
            if (conversationId is null)
            {
                var ip = Helper.GetIpAddressFromHubContext(Context) ?? "[Unknown IP]";
                _logger.LogWarning($"Nhận được tin nhắn khách hàng không hợp lệ từ {ip}: {content}");
                Context.Abort();
                return;
            }

            var message = await _chatService.SendMessageAsync(
                Guid.Parse(conversationId), content, MessageType.User);

            await Clients.Group(conversationId).SendAsync(
                MethodNames.OnReceivedMessage, message, conversationId);
        }

        public async Task OnAdminSendMessage(string content, Guid conversationId)
        {
            if (Context.User is null || !Context.User.IsInRole("Admin"))
            {
                var ip = Helper.GetIpAddressFromHubContext(Context) ?? "[Unknown IP]";
                _logger.LogWarning($"Nhận được tin nhắn admin không hợp lệ từ {ip}: {content}");
                Context.Abort();
                return;
            }

            var message = await _chatService.SendMessageAsync(
                conversationId, content, MessageType.Admin);

            await Clients.Group(conversationId.ToString()).SendAsync(
                MethodNames.OnReceivedMessage, message, conversationId.ToString());
        }

        public override async Task OnConnectedAsync()
        {
            var ip = Helper.GetIpAddressFromHubContext(Context) ?? "[Unknown IP]";

            // Handle for admin connection
            if (Context.User is not null && Context.User.IsInRole("Admin"))
            {
                _store.SetAdminOnline(Context.ConnectionId);
                await Clients.AllExcept(Context.ConnectionId).SendAsync(MethodNames.OnAdminOnline, true);

                var conversationIds = _store.GetAllConversations();
                foreach (var item in conversationIds)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, item.ToString());
                }

                return;
            }

            // Other connections (Clients)
            var conversationId = Context.GetHttpContext()!.Request?.Cookies["ConversationId"];
            if (conversationId is null)
            {
                _logger.LogWarning($"Nhận được yêu cầu kết nối không hợp lệ từ {ip}");
                Context.Abort();
                return;
            }

            // Chặn kết nối nếu đã có customer đang trong hội thoại
            if (_store.IsHasCustomerInConversation(Guid.Parse(conversationId))) {
                _logger.LogWarning($"Yêu cầu kết nối đến đoạn hội thoại đang diễn ra từ {ip}");
                Context.Abort();
                return;
            }

            _store.AddConnection(Guid.Parse(conversationId), Context.ConnectionId);

            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
            if (_store.IsAdminOnline())
            {
                await Groups.AddToGroupAsync(_store.GetAdminConnectionId()!, conversationId);
            }

            await Clients.Group(conversationId).SendAsync(MethodNames.OnClientOnline, true, conversationId);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (exception is not null)
            {
                _logger.LogError(exception, "Đã xảy ra ngoại lệ" + exception.Message);
            }

            if (Context.User is null)
            {
                return;
            }

            if (Context.User.IsInRole("Admin") && Context.ConnectionId == _store.GetAdminConnectionId())
            {
                _store.SetAdminOffline();
                await Clients.AllExcept(Context.ConnectionId).SendAsync(MethodNames.OnAdminOnline, false);
            }
            else if (
                //Context.User.IsInRole("User") && 
                Context.GetHttpContext() is not null && 
                Context.GetHttpContext()!.Request!.Cookies.TryGetValue("ConversationId", out var conversationId))
            {
                _store.RemoveConnection(Guid.Parse(conversationId!));
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId!);
                await Clients.Group(conversationId!).SendAsync(MethodNames.OnClientOnline, false, conversationId);
            }
        }
    }
}
