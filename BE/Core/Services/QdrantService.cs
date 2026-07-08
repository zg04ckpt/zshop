using Qdrant.Client;
using Qdrant.Client.Grpc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Interfaces;
using Core.Utilities;

namespace Core.Services
{
    public class QdrantService : IVectorDbService
    {
        private readonly QdrantClient _client;
        private readonly string _collectionName = "zshop_books";

        public QdrantService()
        {
            var host = EnvHelper.GetQdrantHost();
            int port = EnvHelper.GetQdrantPort();
            
            _client = new QdrantClient(host, port);
        }

        public async Task EnsureCollectionExistsAsync()
        {
            var collections = await _client.ListCollectionsAsync();
            if (!collections.Contains(_collectionName))
            {
                await _client.CreateCollectionAsync(
                    collectionName: _collectionName,
                    vectorsConfig: new VectorParams { Size = 768, Distance = Distance.Cosine } 
                );
            }
        }

        public async Task UpsertVectorAsync(Guid bookId, ReadOnlyMemory<float> vector, string textContent)
        {
            var point = new PointStruct
            {
                Id = bookId, // Trùng với Id của Book trong SQL
                Vectors = vector.ToArray(),
                Payload = { ["text_content"] = textContent }
            };
            
            await _client.UpsertAsync(_collectionName, new[] { point });
        }

        public async Task<List<Guid>> SearchSimilarAsync(ReadOnlyMemory<float> queryVector, int topK = 3)
        {
            var searchResult = await _client.SearchAsync(
                collectionName: _collectionName,
                vector: queryVector.ToArray(),
                limit: (ulong)topK
            );

            var results = new List<Guid>();
            foreach (var point in searchResult)
            {
                if (point.Id.HasUuid)
                {
                    results.Add(new Guid(point.Id.Uuid));
                }
            }
            
            return results;
        }

        public async Task DeleteVectorsAsync(List<Guid> bookIds)
        {
            if (bookIds == null || !bookIds.Any()) return;

            var pointsToDelete = new List<PointId>();
            foreach (var id in bookIds)
            {
                pointsToDelete.Add(id);
            }

            await _client.DeleteAsync(_collectionName, pointsToDelete);
        }
    }
}
