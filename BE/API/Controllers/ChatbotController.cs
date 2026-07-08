using Core.DTOs.Rag;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private readonly IRagOrchestratorService _ragOrchestratorService;

        public ChatbotController(IRagOrchestratorService ragOrchestratorService)
        {
            _ragOrchestratorService = ragOrchestratorService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.UserMessage))
            {
                return BadRequest("Tin nhắn không được để trống.");
            }

            var response = await _ragOrchestratorService.ChatWithRagAsync(request.UserMessage);
            return Ok(response);
        }
    }
}
