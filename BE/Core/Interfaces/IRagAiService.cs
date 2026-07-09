using System;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IRagAiService
    {
        Task<ReadOnlyMemory<float>> GetEmbeddingAsync(string text);
        Task<string> GenerateAnswerAsync(string userQuestion, string contextStr);
        Task<string> ExtractKeywordsAsync(string userMessage);
    }
}
