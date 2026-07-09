using System.Collections.Generic;

namespace Core.DTOs.Rag
{
    public class ChatResponseDto
    {
        public string AiMessage { get; set; }
        public List<SuggestedBookDto> SuggestedBooks { get; set; } = new List<SuggestedBookDto>();
    }
}
