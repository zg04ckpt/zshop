using Core.Exceptions;
using Data;
using Core.Entities.BookFeature;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Interfaces.Repositories;
using Core.DTOs.Book;
using Data.Repositories;

namespace Core.Repositories.Impl
{
    public class BookRepository : BaseRepository<Book, Guid>, IBookRepository
    {
        public BookRepository(AppDbContext context) : base(context)
        {
        }

        public async Task AddToCategory(Guid bookId, int[] categoryIds)
        {
            if (categoryIds.Length != categoryIds.ToHashSet().Count)
                throw new BadRequestException("Mã danh mục bị trùng");

            // To check cate if id is exist
            var validIds = context.Categories.Select(c => c.Id).ToHashSet();

            foreach (var id in categoryIds)
            {
                if (!validIds.Contains(id))
                    throw new BadRequestException("Mã danh mục không hợp lệ");
                await context.BookCategories.AddAsync(new BookCategory
                {
                    BookId = bookId,
                    CategoryId = id
                });
            } 
        }

        public async Task<BoughtBookListItemDTO[]> GetBoughtBooks(Guid userId)
        {
            var books = await context.OrderDetails.AsNoTracking()
                .Where(e => e.Order.CustomerId == userId)
                .Select(e => new
                {
                    e.BookId,
                    PurchasedDate = e.Order.OrderDate
                })
                .GroupBy(e => e.BookId)
                .Select(g => new
                {
                    BookId = g.Key,
                    LastPurchasedAt = g.Max(g => g.PurchasedDate),
                    PurchaseCount = g.Count()
                })
                .Join(context.Books, g => g.BookId, b => b.Id, (g, b) => new BoughtBookListItemDTO
                {
                    Id = b.Id,
                    Name = b.Name,
                    AvgRate = b.AvgRate,
                    Categories = b.BookCategories.Select(bc => bc.Category.Name).ToArray(),
                    Cover = b.Cover,
                    Currency = b.Currency,
                    LastPurchasedAt = g.LastPurchasedAt,
                    Price = b.Price,
                    PurchaseCount = g.PurchaseCount,
                    SoldCount = b.SoldCount,
                    UpdatedAt = b.UpdatedAt
                }) 
                .ToArrayAsync();
            return books;
        }

        public async Task<BookListItemDTO[]> GetNewest(int count)
        {
            var books = await context.Books
                .OrderByDescending(e => e.CreatedAt)
                .Take(count)
                .Select(e => new BookListItemDTO
                {
                    Id = e.Id,
                    SoldCount = e.SoldCount,
                    AvgRate = e.AvgRate,
                    Categories = e.BookCategories.Select(e => e.Category.Name).ToArray(),
                    Currency = e.Currency,
                    Name = e.Name,  
                    Price = e.Price,
                    UpdatedAt = e.UpdatedAt,
                    Cover = e.Cover,
                }).ToArrayAsync();
            return books;
        }

        public async Task<BookListItemDTO[]> GetTopSell(int count)
        {
            var books = await context.Books
                .OrderByDescending(e => e.SoldCount)
                .Take(count)
                .Select(e => new BookListItemDTO
                {
                    Id = e.Id,
                    SoldCount = e.SoldCount,
                    AvgRate = e.AvgRate,
                    Categories = e.BookCategories.Select(e => e.Category.Name).ToArray(),
                    Currency = e.Currency,
                    Price = e.Price,
                    Name = e.Name,
                    UpdatedAt = e.UpdatedAt,
                    Cover = e.Cover,
                }).ToArrayAsync();
            return books;
        }

        public async Task UpdateCategory(Guid bookId, int[] categoryIds)
        {
            if (categoryIds.Length != categoryIds.ToHashSet().Count)
                throw new BadRequestException("Mã danh mục bị trùng");

            // To check cate if id is exist
            var validIds = context.Categories
                .Select(c => c.Id)
                .ToHashSet();

            var oldCategories = await context.BookCategories
                .Where(c => c.BookId == bookId)
                .ToDictionaryAsync(e => e.CategoryId);

            foreach (var id in categoryIds)
            {
                if (!validIds.Contains(id))
                    throw new BadRequestException("Mã danh mục không hợp lệ");
                if (oldCategories.ContainsKey(id))
                {
                    oldCategories.Remove(id); // remove category that don't need to change
                }
                else
                {
                    await context.BookCategories.AddAsync(new BookCategory
                    {
                        BookId = bookId,
                        CategoryId = id
                    });
                }

            }

            // The remaining is categories need to be removed 
            context.BookCategories.RemoveRange(oldCategories.Values);
        }
    }
}
