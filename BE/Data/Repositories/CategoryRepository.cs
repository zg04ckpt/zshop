using Data;
using Core.Entities.BookFeature;
using Microsoft.EntityFrameworkCore;
using Core.Interfaces.Repositories;
using Core.DTOs.Book;
using Data.Repositories;

namespace Core.Repositories.Impl
{
    public class CategoryRepository : Repository<Category>, ICategoryRepository
    {
        public CategoryRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<CategoryListItemDTO[]> GetTopSell(int count)
        {
            var books = await _context.Set<BookCategory>().AsNoTracking()
                .Join(
                    _context.Set<Book>(),
                    bc => bc.BookId,
                    b => b.Id,
                    (bc, b) => new {
                        bc.CategoryId,
                        b.SoldCount,
                    })
                .GroupBy(e => e.CategoryId)
                .Select(g => new
                {
                    CategoryId = g.Key,
                    TotalSoldCount = g.Sum(g => g.SoldCount)
                })
                .OrderByDescending(g => g.TotalSoldCount)
                .Take(count)
                .Join(
                      _context.Set<Category>(),
                      g => g.CategoryId,
                      c => c.Id,
                      (g, c) => new CategoryListItemDTO
                      {
                          Id = g.CategoryId,
                          CreatedAt = c.CreatedAt,
                          Name = c.Name,
                          ParentId = c.ParentId,
                          Thumbnail = c.Thumbnail,
                          UpdatedAt = c.UpdatedAt,
                      })
                .ToArrayAsync();

            return books;
        }

        public async Task<bool> HasBookInCate(int cateId)
        {
            return await _context.Set<BookCategory>().AnyAsync(e => e.CategoryId == cateId);
        }
    }
}
