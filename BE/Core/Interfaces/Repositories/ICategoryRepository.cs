using Core.DTOs.Book;
using Core.Entities.BookFeature;

namespace Core.Interfaces.Repositories
{
    public interface ICategoryRepository : IRepository<Category>
    {
        Task<bool> HasBookInCate(int cateId);
        Task<CategoryListItemDTO[]> GetTopSell(int count);
    }
}
