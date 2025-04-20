using Core.DTOs.Book;
using Core.Entities.BookFeature;
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
        Task<BookListItemDTO[]> GetTopSell(int count);
        Task<BookListItemDTO[]> GetNewest(int count);
        Task<BoughtBookListItemDTO[]> GetBoughtBooks(Guid userId);
    }
}
