using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.DTOs.Rag;
using Core.Entities.BookFeature;
using Core.Interfaces;

namespace Core.Services
{
    public class RagOrchestratorService : IRagOrchestratorService
    {
        private readonly IRagAiService _aiService;
        private readonly IVectorDbService _vectorDbService;
        private readonly IUnitOfWork _uow;

        public RagOrchestratorService(
            IRagAiService aiService,
            IVectorDbService vectorDbService,
            IUnitOfWork uow)
        {
            _aiService = aiService;
            _vectorDbService = vectorDbService;
            _uow = uow;
        }

        public async Task SyncBooksAsync(List<Guid> bookIds)
        {
            if (bookIds == null || !bookIds.Any()) return;

            await _vectorDbService.EnsureCollectionExistsAsync();

            var books = await _uow.Repository<Book>().GetAllAsync(
                b => bookIds.Contains(b.Id),
                null, null, null, null,
                b => b.BookCategories,
                b => b.Reviews
            );

            var allCategories = await _uow.Repository<Category>().GetAllAsync(c => true);
            var catDict = allCategories.ToDictionary(c => c.Id, c => c.Name);

            foreach (var book in books)
            {
                var sb = new StringBuilder();
                sb.AppendLine($"ID: {book.Id}");
                sb.AppendLine($"TÊN SÁCH: {book.Name}");
                sb.AppendLine($"TÁC GIẢ: {book.Author}");
                sb.AppendLine($"GIÁ: {book.Price} {book.Currency}");
                
                var categoryNames = book.BookCategories?
                    .Where(bc => catDict.ContainsKey(bc.CategoryId))
                    .Select(bc => catDict[bc.CategoryId])
                    .ToList() ?? new List<string>();
                sb.AppendLine($"THỂ LOẠI: {string.Join(", ", categoryNames)}");
                sb.AppendLine($"MÔ TẢ: {book.Description}");

                if (book.Reviews != null && book.Reviews.Any())
                {
                    sb.AppendLine("TOP ĐÁNH GIÁ:");
                    var topReviews = book.Reviews
                        .OrderByDescending(r => r.Rate)
                        .Take(3)
                        .ToList();
                    foreach (var review in topReviews)
                    {
                        sb.AppendLine($"- {review.Rate} sao: {review.Content}");
                    }
                }

                string contentToEmbed = sb.ToString();
                var vector = await _aiService.GetEmbeddingAsync(contentToEmbed);
                await _vectorDbService.UpsertVectorAsync(book.Id, vector, contentToEmbed);
            }
        }

        public async Task<ChatResponseDto> ChatWithRagAsync(string userMessage)
        {
            var result = new ChatResponseDto();
            
            // Ensure collection exists before doing any operations
            await _vectorDbService.EnsureCollectionExistsAsync();

            // 1. Trích xuất từ khóa (Optional nhưng giúp tăng độ chính xác)
            var keywords = await _aiService.ExtractKeywordsAsync(userMessage);

            // 2. Sinh vector cho từ khóa
            var queryVector = await _aiService.GetEmbeddingAsync(keywords);

            // 3. Tìm sách tương đồng (chỉ lấy những sách có điểm cao, ví dụ > 0.5)
            var bookIds = await _vectorDbService.SearchSimilarAsync(queryVector, 3, 0.5f);

            var contextSb = new StringBuilder();
            if (bookIds.Any())
            {
                // 4. Lấy thông tin thật từ SQL
                var books = await _uow.Repository<Book>().GetAllAsync(
                    b => bookIds.Contains(b.Id)
                );
                
                foreach (var book in books)
                {
                    contextSb.AppendLine($"TÊN SÁCH: {book.Name}");
                    contextSb.AppendLine($"TÁC GIẢ: {book.Author}");
                    contextSb.AppendLine($"GIÁ: {book.Price} {book.Currency}");
                    contextSb.AppendLine($"MÔ TẢ: {book.Description}");
                    contextSb.AppendLine("---");

                    result.SuggestedBooks.Add(new SuggestedBookDto
                    {
                        Id = book.Id,
                        Name = book.Name,
                        ImageUrl = book.Cover,
                        Price = book.Price
                    });
                }
            }

            // 5. Sinh câu trả lời. Nếu không có sách, contextSb sẽ rỗng.
            var answer = await _aiService.GenerateAnswerAsync(userMessage, contextSb.ToString());
            result.AiMessage = answer;

            return result;
        }

        public async Task RunAutoSyncBatchAsync()
        {
            var bookRepo = _uow.Repository<Book>();
            var syncRepo = _uow.Repository<Core.Entities.BookFeature.BookVectorSync>();

            // 1. Ensure collection exists
            await _vectorDbService.EnsureCollectionExistsAsync();

            // 2. Handle Hard Deletes (books in BookVectorSyncs but NOT in Books)
            // Left Anti Join equivalent
            var allSyncs = await syncRepo.GetAllAsync(x => true);
            var allBooks = await bookRepo.GetAllAsync(x => true);
            
            var deletedSyncs = allSyncs.Where(sync => !allBooks.Any(b => b.Id == sync.BookId)).ToList();
            if (deletedSyncs.Any())
            {
                var deletedIds = deletedSyncs.Select(s => s.BookId).ToList();
                await _vectorDbService.DeleteVectorsAsync(deletedIds);
                foreach(var sync in deletedSyncs)
                {
                    await syncRepo.DeleteAsync(sync);
                }
            }

            // 3. Find 20 books to sync (either not synced yet, or updated since last sync)
            var booksToSync = allBooks
                .GroupJoin(allSyncs, b => b.Id, sync => sync.BookId, (b, syncs) => new { Book = b, Sync = syncs.FirstOrDefault() })
                .Where(x => x.Sync == null || x.Book.UpdatedAt > x.Sync.LastSyncedAt)
                .OrderBy(x => x.Book.UpdatedAt)
                .Take(20)
                .Select(x => x.Book)
                .ToList();

            if (!booksToSync.Any())
            {
                if (deletedSyncs.Any())
                {
                    await _uow.SaveChangesAsync();
                }
                return;
            }

            // 4. Generate vectors and upsert
            foreach (var book in booksToSync)
            {
                try
                {
                    string textContent = $"Tên sách: {book.Name}. Mô tả: {book.Description}. Giá: {book.Price}";
                    
                    if (book.BookCategories != null && book.BookCategories.Any())
                    {
                        var categoryNames = book.BookCategories.Where(c => c.Category != null).Select(c => c.Category.Name);
                        if (categoryNames.Any())
                        {
                            textContent += $". Thể loại: {string.Join(", ", categoryNames)}";
                        }
                    }

                    var vector = await _aiService.GetEmbeddingAsync(textContent);
                    await _vectorDbService.UpsertVectorAsync(book.Id, vector, textContent);

                    // Update sync state
                    var syncRecord = allSyncs.FirstOrDefault(s => s.BookId == book.Id);
                    if (syncRecord == null)
                    {
                        syncRecord = new Core.Entities.BookFeature.BookVectorSync
                        {
                            BookId = book.Id,
                            LastSyncedAt = DateTime.UtcNow
                        };
                        await syncRepo.AddAsync(syncRecord);
                    }
                    else
                    {
                        syncRecord.LastSyncedAt = DateTime.UtcNow;
                        syncRecord.ErrorMessage = null;
                        await syncRepo.UpdateAsync(syncRecord);
                    }
                }
                catch (Exception ex)
                {
                    var syncRecord = allSyncs.FirstOrDefault(s => s.BookId == book.Id);
                    if (syncRecord == null)
                    {
                        syncRecord = new Core.Entities.BookFeature.BookVectorSync
                        {
                            BookId = book.Id,
                            LastSyncedAt = DateTime.MinValue,
                            ErrorMessage = ex.Message
                        };
                        await syncRepo.AddAsync(syncRecord);
                    }
                    else
                    {
                        syncRecord.ErrorMessage = ex.Message;
                        await syncRepo.UpdateAsync(syncRecord);
                    }
                }
            }

            await _uow.SaveChangesAsync();
        }
    }
}
