using Core.Configurations;
using Core.DTOs.Chat;
using Core.DTOs.Common;
using Core.Interfaces.Services;
using Core.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace API.Controllers.v1
{
    [Route("api/v{version:apiVersion}/chats")]
    [ApiController]
    [ApiVersion("1.0")]
    public class ChatsController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly JwtConfig _jwtConfig;

        public ChatsController(
            IOptions<JwtConfig> config,
            IChatService chatService)
        {
            _chatService = chatService;
            _jwtConfig = config.Value;
        }

        [HttpGet("existing-conversation")]
        public async Task<IActionResult> GetExistingConversation()
        {
            if (Request.Cookies.TryGetValue("ConversationId", out var conversationId)) {
                var res = await _chatService.GetConversationByIdAsync(Guid.Parse(conversationId!));
                return Ok(res);
            }
            return NotFound(new ApiErrorResult("Hội thoại không tồn tại"));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> StartConversation()
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(User)!);
            var res = await _chatService.StartConversationAsync(null, userId);
            Response.Cookies.Append("ConversationId", res.Data.Id.ToString(), new CookieOptions
            {
                Path = "/",
                HttpOnly = true,
                SameSite = SameSiteMode.None,
                Secure = true,
                MaxAge = TimeSpan.FromMinutes(_jwtConfig.RefreshTokenTTL)
            });
            return Ok(res);
        }

        [HttpPost("start-anonymous")]
        [AllowAnonymous]
        public async Task<IActionResult> StartConversation([FromBody] StartAnonymousConversationRequestDTO request)
        {
            var res = await _chatService.StartConversationAsync(request.CustomerName, null);
            var cookieOptions = new CookieOptions
            {
                Path = "/",
                HttpOnly = true,
                SameSite = SameSiteMode.None,
                Secure = true,
                MaxAge = TimeSpan.FromDays(7)
            };
            Response.Cookies.Append("ConversationId", res.Data.Id.ToString(), cookieOptions);
            return Ok(res);
        }

        [HttpGet("manage")]
        [Authorize("AllowTest")]
        public async Task<IActionResult> GetAllConversations([FromQuery] int index)
        {
            return Ok(await _chatService.GetConversationsAsync(index));
        }

        [HttpGet("manage/{id}")]
        [Authorize("AllowTest")]
        public async Task<IActionResult> GetConversation(Guid id)
        {
            return Ok(await _chatService.GetConversationByIdAsync(id));
        }

        [HttpPost("manage/delete")]
        [Authorize("AllowTest")]
        public async Task<IActionResult> DeleteConversation(DeleteConversationsRequest request)
        {
            return Ok(await _chatService.DeleteConversationsAsync(request));
        }
    }
}
