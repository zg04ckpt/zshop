using Core.DTOs.Book;
using Core.Entities.BookFeature;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositories
{
    public interface ICategoryRepository : IBaseRepository<Category, int>
    {
        Task<bool> HasBookInCate(int cateId);
        Task<CategoryListItemDTO[]> GetTopSell(int count);
    }
}
