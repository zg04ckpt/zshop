using OpenAI;
using OpenAI.Chat;
using OpenAI.Embeddings;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Utilities;

using Microsoft.Extensions.Configuration;

namespace Core.Services
{
    public class RagAiService : IRagAiService
    {
        private readonly EmbeddingClient _embeddingClient;
        private readonly ChatClient _chatClient;

        public RagAiService(IConfiguration configuration)
        {
            var apiKey = EnvHelper.GetRagApiKey();
            var endpoint = EnvHelper.GetRagEndpoint(); 
            var chatModel = configuration["AiSettings:ChatModel"] ?? "llama3.2:1b";
            var embedModel = configuration["AiSettings:EmbeddingModel"] ?? "nomic-embed-text";

            OpenAIClient aiClient;
            var credential = new System.ClientModel.ApiKeyCredential(apiKey);

            if (!string.IsNullOrEmpty(endpoint))
            {
                var options = new OpenAIClientOptions { Endpoint = new Uri(endpoint) };
                aiClient = new OpenAIClient(credential, options);
            }
            else
            {
                aiClient = new OpenAIClient(credential);
            }

            _embeddingClient = aiClient.GetEmbeddingClient(embedModel);
            _chatClient = aiClient.GetChatClient(chatModel);
        }

        public async Task<ReadOnlyMemory<float>> GetEmbeddingAsync(string text)
        {
            var response = await _embeddingClient.GenerateEmbeddingAsync(text);
            return response.Value.ToFloats();
        }

        public async Task<string> ExtractKeywordsAsync(string userMessage)
        {
            string systemPrompt = "Nhiệm vụ của bạn là đọc câu hỏi của người dùng và in ra tối đa 5 từ khóa quan trọng nhất để tìm kiếm sách. Bỏ qua các từ chào hỏi, thừa thãi. Không giải thích, chỉ in từ khóa cách nhau bằng dấu phẩy.";
            
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userMessage)
            };

            var response = await _chatClient.CompleteChatAsync(messages);
            return response.Value.Content[0].Text;
        }

        public async Task<string> GenerateAnswerAsync(string userQuestion, string contextStr)
        {
            string systemPrompt = $@"Bạn là nhân viên tư vấn sách của ZShop. Bạn CHỈ ĐƯỢC PHÉP dựa vào phần THÔNG TIN SÁCH dưới đây để trả lời khách. 
TUYỆT ĐỐI không sử dụng kiến thức bên ngoài, không bịa đặt thông tin. 
Nếu THÔNG TIN SÁCH trống hoặc không có thông tin phù hợp với câu hỏi, HÃY TRẢ LỜI ĐÚNG CÂU SAU: 'Dạ hiện tại em chưa tìm thấy thông tin phù hợp với yêu cầu của anh/chị, anh/chị có thể nói rõ hơn được không ạ?'

THÔNG TIN SÁCH:
{contextStr}";

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userQuestion)
            };

            var response = await _chatClient.CompleteChatAsync(messages);
            return response.Value.Content[0].Text;
        }
    }
}
