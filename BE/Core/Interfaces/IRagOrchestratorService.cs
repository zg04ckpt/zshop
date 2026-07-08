using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.DTOs.Rag;

namespace Core.Interfaces
{
    public interface IRagOrchestratorService
    {
        Task SyncBooksAsync(List<Guid> bookIds);
        Task<ChatResponseDto> ChatWithRagAsync(string userMessage);
        Task RunAutoSyncBatchAsync();
    }
}
