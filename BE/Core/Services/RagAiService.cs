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

            return await CompleteChatRawAsync(messages);
        }

        public async Task<string> GenerateAnswerAsync(string userQuestion, string contextStr)
        {
            bool hasContext = !string.IsNullOrWhiteSpace(contextStr);
            string systemPrompt;

            if (hasContext)
            {
                systemPrompt = $@"Bạn là 'ZShop AI' - một nhân viên tư vấn sách vô cùng nhiệt tình, duyên dáng và chuyên nghiệp của cửa hàng ZShop.
Giọng điệu của bạn: Thân thiện, lễ phép (luôn gọi khách là 'bạn' hoặc 'anh/chị', xưng 'em' hoặc 'mình'), có sử dụng emoji phù hợp.

Quy tắc cốt lõi (CỰC KỲ QUAN TRỌNG):
1. CHỈ TRẢ LỜI dựa trên [THÔNG TIN SÁCH] được cung cấp bên dưới. TUYỆT ĐỐI không tự bịa đặt, không sử dụng kiến thức bên ngoài.
2. LUÔN LUÔN mở đầu câu trả lời bằng một câu dẫn dắt lịch sự, ví dụ như: 'Dạ, dựa trên thông tin anh/chị cung cấp, em tìm thấy một số quyển sách sau đây, vui lòng click vào để xem chi tiết ạ:' (hoặc thay đổi linh hoạt cho tự nhiên).
3. Nếu khách chỉ chào hỏi bình thường, hãy đáp lại lịch sự và hỏi xem họ muốn tìm sách gì.
4. Nếu câu hỏi nằm ngoài nội dung [THÔNG TIN SÁCH] hoặc không tìm thấy, hãy trả lời: 'Dạ, hiện tại trong hệ thống ZShop em chưa tìm thấy thông tin phù hợp cho yêu cầu này. Anh/chị có thể nói rõ hơn được không ạ?'
5. Trình bày ngắn gọn, in đậm (**Tên Sách**) khi nhắc đến một cuốn sách.

[THÔNG TIN SÁCH]:
{contextStr}";
            }
            else
            {
                systemPrompt = $@"Bạn là 'ZShop AI' - một nhân viên tư vấn sách vô cùng nhiệt tình, duyên dáng và chuyên nghiệp của cửa hàng ZShop.
Giọng điệu của bạn: Thân thiện, lễ phép (luôn gọi khách là 'bạn' hoặc 'anh/chị', xưng 'em' hoặc 'mình'), có sử dụng emoji phù hợp.

Quy tắc cốt lõi:
1. Người dùng đang trò chuyện bình thường hoặc hệ thống không tìm thấy cuốn sách nào phù hợp với yêu cầu của họ.
2. Hãy đáp lại lịch sự, trò chuyện tự nhiên với khách hàng. 
3. Nếu họ hỏi về một cuốn sách cụ thể, hãy khéo léo báo: 'Dạ, hiện tại em tìm trong hệ thống ZShop thì chưa thấy cuốn sách này. Anh/chị có thể cho em xin thêm thông tin hoặc đổi từ khóa khác được không ạ?'
4. TUYỆT ĐỐI KHÔNG tự bịa ra sách, KHÔNG lấy kiến thức bên ngoài để giới thiệu sách không có ở cửa hàng. Chỉ trò chuyện và hỗ trợ.";
            }

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userQuestion)
            };

            return await CompleteChatRawAsync(messages);
        }

        private async Task<string> CompleteChatRawAsync(List<ChatMessage> messages)
        {
            var requestBody = new
            {
                model = _chatClient.Model,
                messages = messages.Select(m => new
                {
                    role = m is SystemChatMessage ? "system" : "user",
                    content = m.Content[0].Text
                })
            };

            using var httpClient = new System.Net.Http.HttpClient();
            var endpoint = EnvHelper.GetRagEndpoint() ?? "https://api.openai.com/v1/";
            if (!endpoint.EndsWith("/")) endpoint += "/";
            
            var request = new System.Net.Http.HttpRequestMessage(System.Net.Http.HttpMethod.Post, endpoint + "chat/completions");
            request.Headers.Add("Authorization", $"Bearer {EnvHelper.GetRagApiKey()}");
            request.Content = new System.Net.Http.StringContent(System.Text.Json.JsonSerializer.Serialize(requestBody), System.Text.Encoding.UTF8, "application/json");

            var responseMessage = await httpClient.SendAsync(request);
            responseMessage.EnsureSuccessStatusCode();

            var responseJson = await responseMessage.Content.ReadAsStringAsync();
            var doc = System.Text.Json.JsonDocument.Parse(responseJson);
            return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";
        }
    }
}
