using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Core.Interfaces
{
    public interface IVectorDbService
    {
        Task EnsureCollectionExistsAsync();
        Task UpsertVectorAsync(Guid bookId, ReadOnlyMemory<float> vector, string textContent);
        Task<List<Guid>> SearchSimilarAsync(ReadOnlyMemory<float> queryVector, int topK = 3);
        Task DeleteVectorsAsync(List<Guid> bookIds);
    }
}
