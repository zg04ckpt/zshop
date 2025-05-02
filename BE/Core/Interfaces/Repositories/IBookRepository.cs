using Core.DTOs.Book;
using Core.Entities.BookFeature;
using Core.Interfaces.Services.External;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositories
{
    public interface IBookRepository : IBaseRepository<Book, Guid>
    {
        Task AddToCategory(Guid bookId, int[] categoryIds);
        Task UpdateCategory(Guid bookId, int[] categoryIds);
        Task SetRemainingBooksInStock(Guid bookId, int purchasedCount);
        Task<BookListItemDTO[]> GetTopSell(int count);
        Task<BookListItemDTO[]> GetNewest(int count);
        Task<BookListItemDTO[]> GetRandom(int count);
        Task<BoughtBookListItemDTO[]> GetBoughtBooks(Guid userId);
        Task CreateOrUpdateBookImages(Guid bookId, List<CreateOrUpdateBookImageListItemDTO> images, IStorageService storageService);
    }
}
