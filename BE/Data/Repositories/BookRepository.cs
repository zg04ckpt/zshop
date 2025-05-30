﻿using Core.Exceptions;
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
using Core.Interfaces.Services.External;
using Core.Services.External;

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

        public async Task CreateOrUpdateBookImages(Guid bookId,
            List<CreateOrUpdateBookImageListItemDTO> images, IStorageService storageService)
        {
            var map =  await context.BookImages
                .Where(e => e.BookId == bookId)
                .ToDictionaryAsync(e => e.Id);

            foreach (var image in images)
            {
                if (image.Id == -1)
                {
                    // image file must be notnull when create new image
                    if (image.Image == null)
                    {
                        throw new BadRequestException("Dữ liệu ảnh mới trống");
                    }

                    await context.BookImages.AddAsync(new BookImage
                    {
                        BookId = bookId,
                        ImageUrl = await storageService.SaveImage(image.Image)
                            ?? throw new InternalServerErrorException("Lưu ảnh minh họa thất bại")
                    });
                }
                else
                {
                    // Update existing
                    if (map.TryGetValue(image.Id, out var oldImage))
                    {
                        // If Id != null and Image file != null => Update image
                        if (image.Image != null)
                        {
                            if (!await storageService.RemoveImage(oldImage.ImageUrl))
                                throw new InternalServerErrorException("Xóa ảnh minh họa cũ thất bại.");
                            oldImage.ImageUrl = await storageService.SaveImage(image.Image)
                                ?? throw new InternalServerErrorException("Cập nhật ảnh minh họa thất bại.");
                            context.BookImages.Update(oldImage);
                        }
                        map.Remove(image.Id);
                    } 
                    else
                    {
                        throw new BadRequestException("Thông tin định danh ảnh không hợp lệ.");
                    }
                }
            }

            // Remaining image => delete
            foreach (var image in map.Values)
            {
                if (!await storageService.RemoveImage(image.ImageUrl))
                    throw new InternalServerErrorException("Xóa ảnh minh họa cũ thất bại.");
                context.BookImages.Remove(image);
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
                    StockCount = b.StockCount,
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
                    StockCount = e.StockCount,
                    Cover = e.Cover,
                }).ToArrayAsync();
            return books;
        }

        public async Task<BookListItemDTO[]> GetRandom(int count)
        {
            var books = await context.Books
                .OrderBy(e => Guid.NewGuid())
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
                    StockCount = e.StockCount,
                    UpdatedAt = e.UpdatedAt,
                    Cover = e.Cover,
                })
                .ToArrayAsync();
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
                    StockCount = e.StockCount,
                    Cover = e.Cover,
                }).ToArrayAsync();
            return books;
        }

        public async Task SetRemainingBooksInStock(Guid bookId, int purchasedCount)
        {
            // Tìm sách theo bookId
            var book = await context.Books
                .FirstOrDefaultAsync(b => b.Id == bookId) 
                ?? throw new BadRequestException($"Book with ID {bookId} not found.");

            // Cập nhật hai trường
            book.SoldCount += purchasedCount;
            book.StockCount -= purchasedCount;
            book.UpdatedAt = DateTime.UtcNow;

            context.Books.Update(book);
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
