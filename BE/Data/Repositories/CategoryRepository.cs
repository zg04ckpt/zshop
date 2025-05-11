using Data;
using Core.Entities.BookFeature;
using Microsoft.EntityFrameworkCore;
using Core.Interfaces.Repositories;
using Core.DTOs.Book;
using Microsoft.EntityFrameworkCore.Internal;

namespace Core.Repositories.Impl
{
    public class CategoryRepository : BaseRepository<Category, int>, ICategoryRepository
    {
        public CategoryRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<CategoryListItemDTO[]> GetTopSell(int count)
        {
            var books = await context.BookCategories.AsNoTracking()
                .Join(
                    context.Books,
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
                      context.Categories,
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
            return await context.BookCategories.AnyAsync(e => e.CategoryId == cateId);
        }
    }
}
