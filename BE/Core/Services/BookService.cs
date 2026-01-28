using Core.DTOs.Book;
using Core.DTOs.Common;
using Core.Entities.BookFeature;
using Core.Entities.PaymentFeature;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Utilities;
using LinqKit;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace Core.Services
{
    public class BookService : IBookService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStorageService _storageService;

        public BookService(
            IStorageService storageService, 
            IUnitOfWork unitOfWork)
        {
            _storageService = storageService;
            _unitOfWork = unitOfWork;
        }

        #region Book
        public async Task<ApiResult> CreateBook(BookDTO data)
        {
            var bookRepo = _unitOfWork.Books;

            if (await bookRepo.ExistsAsync(e => e.Name == data.Name))
                throw new BadRequestException("Tên đã tồn tại.");
            if (data.CategoryIds.Length > 3)
                throw new BadRequestException("Chọn tối đa 3 danh mục.");

            // Add cover
            if (data.Cover is null)
                throw new BadRequestException("Vui lòng cung cấp ảnh bìa.");
            if (data.CategoryIds.Length == 0)
                throw new BadRequestException("Vui lòng thêm ít nhất 1 danh mục thể loại.");
            if (data.Images.Count < 3)
                throw new BadRequestException("Vui lòng thêm ít nhất 3 ảnh minh họa.");

            data.Name = Regex.Replace(data.Name, @"\s+", " ");

            var book = new Book
            {
                Id = Guid.NewGuid(),
                Name = data.Name,
                Author = data.Author,
                Currency = "VNĐ",
                Cover = await _storageService.SaveImage(data.Cover)
                        ?? throw new InternalServerErrorException("Lưu ảnh bìa thất bại"),
                Description = data.Description,
                Language = data.Language,
                Price = data.Price,
                PublishYear = data.PublishYear,
                PageCount = data.PageCount,
                Publisher = data.Publisher, 
                StockCount = data.Stock,
                SoldCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await bookRepo.AddAsync(book);
            await bookRepo.AddToCategory(book.Id, data.CategoryIds);
            await bookRepo.CreateOrUpdateBookImages(book.Id, data.Images, _storageService);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult("Tạo sách mới thành công.");
        }

        public async Task<ApiResult> UpdateBook(string id, BookDTO data)
        {
            var bookRepo = _unitOfWork.Books;

            var book = await bookRepo.GetFirstAsync(b => b.Id.ToString() == id)
                ?? throw new BadRequestException("Sách không tồn tại.");
            if (data.CategoryIds.Length > 3)
                throw new BadRequestException("Chọn tối đa 3 danh mục.");
            if (data.Images.Count < 3)
                throw new BadRequestException("Vui lòng thêm ít nhất 3 ảnh minh họa.");

            // Update cover
            if (data.Cover != null)
            {
                if (!await _storageService.RemoveImage(book.Cover))
                    throw new InternalServerErrorException("Cập nhật ảnh bìa thất bại.");
                book.Cover = await _storageService.SaveImage(data.Cover)
                    ?? throw new InternalServerErrorException("Cập nhật ảnh bìa thất bại.");
            }

            // Update other
            book.Name = data.Name;
            book.UpdatedAt = DateTime.UtcNow;
            book.Author = data.Author;
            book.Publisher = data.Publisher;
            book.PageCount = data.PageCount;
            book.PublishYear = data.PublishYear;
            book.Language = data.Language;
            book.Price = data.Price;
            book.Description = data.Description;
            book.StockCount = data.Stock;

            await bookRepo.UpdateAsync(book);
            await bookRepo.UpdateCategory(book.Id, data.CategoryIds);
            await bookRepo.CreateOrUpdateBookImages(book.Id, data.Images, _storageService);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult("Cập nhật sách thành công.");
        }

        public async Task<ApiResult> DeleteBook(string id)
        {
            var bookRepo = _unitOfWork.Books;

            var book = await bookRepo.GetFirstAsync(e => e.Id.ToString() == id)
                ?? throw new BadRequestException("Sách không tồn tại.");

            await bookRepo.DeleteAsync(book);
            await _unitOfWork.SaveChangesAsync();

            if (!await _storageService.RemoveImage(book.Cover))
                throw new InternalServerErrorException("Xóa ảnh bìa thất bại.");

            return new ApiSuccessResult("Xóa sách thành công.");
        }

        public async Task<ApiResult<Paginated<BookListItemDTO>>> GetBooksAsListItem(BookSearchDTO data)
        {
            var bookRepo = _unitOfWork.Repository<Book>();
            var filter = PredicateBuilder.New<Book>(true);

            // filter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
            if (!string.IsNullOrEmpty(data.Name))
                filter.And(e => e.Name.Contains(data.Name));
            if (data.MinPrice != null)
                filter.And(e => e.Price >= data.MinPrice);
            if (data.MaxPrice != null)
                filter.And(e => e.Price <= data.MaxPrice);
            if (data.CategoryIds?.Length > 0)
            {
                filter.And(book =>
                    book.BookCategories.Count(bc => data.CategoryIds.Contains(bc.CategoryId)) == data.CategoryIds.Length);
            }

            var books = await bookRepo.GetPagingAsync(
                predicate: filter,
                pageIndex: data.PageIndex,
                pageSize: data.PageSize,
                selector: book => new BookListItemDTO
                {
                    Id = book.Id,
                    Name = book.Name,
                    Currency = book.Currency,
                    AvgRate = book.Reviews.Average(r => (decimal?)r.Rate) ?? 0,
                    Price = book.Price,
                    SoldCount = book.SoldCount,
                    StockCount = book.StockCount,
                    Cover = book.Cover,
                    UpdatedAt = book.UpdatedAt,
                    Categories = book.BookCategories.Select(e => e.Category.Name).ToArray()
                },
                orderBy: e => EF.Property<object>(e, Helper.ConvertToValidPropName(data.SortBy)),
                asc: data.Order.ToLower() == "asc");

            return new ApiSuccessResult<Paginated<BookListItemDTO>>(books);
        }

        public async Task<ApiResult<BookDetailDTO>> GetBookDetail(string id)
        {
            var bookRepo = _unitOfWork.Repository<Book>();

            var book = await bookRepo.GetFirstAsync(
                predicate: e => e.Id.ToString() == id,
                selector: book => new BookDetailDTO
                {
                    Id = book.Id,
                    Name = book.Name,
                    Author = book.Author,
                    Currency = book.Currency,
                    AvgRate = book.Reviews.Average(r => (decimal?)r.Rate) ?? 0,
                    Description = book.Description,
                    Language = book.Language,
                    Price = book.Price,
                    StockCount = book.StockCount,
                    Categories = book.BookCategories.Select(e => e.Category.Name).ToArray(),
                    Images = book.Images.Select(e => new BookDetailImageListItem
                    {
                        Id = e.Id,
                        ImageUrl = e.ImageUrl
                    }
                    ).ToArray(),
                    PublishYear = book.PublishYear,
                    PageCount = book.PageCount,
                    Publisher = book.Publisher,
                    SoldCount = book.SoldCount,
                    Cover = book.Cover,
                    CreatedAt = book.CreatedAt,
                    UpdatedAt = book.UpdatedAt,
                })
                ?? throw new BadRequestException("Sách không tồn tại.");

            return new ApiSuccessResult<BookDetailDTO>(book);
        }

        public async Task<ApiResult> ReviewBook(CreateBookReviewDTO data, ClaimsPrincipal claims)
        {
            var bookRepo = _unitOfWork.Books;

            // Check valid rating
            if (data.Rate > 5 || data.Rate < 1)
            {
                throw new BadRequestException("Vui đánh giá từ 1 - 5 sao.");
            }

            // Only user bought this book can review it.
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            if (!await _unitOfWork.Repository<OrderDetail>().ExistsAsync(
                e => e.BookId == data.BookId && 
                e.Order.CustomerId == userId))
            {
                throw new BadRequestException("Vui lòng mua sản phẩm để đánh giá.");
            }
            var book = await bookRepo.GetFirstAsync(e => e.Id == data.BookId)
                ?? throw new BadRequestException("Sách không tồn tại.");

            try
            {
                await _unitOfWork.BeginTransactionAsync();
                // Review
                var review = new Review
                {
                    BookId = data.BookId,
                    Content = data.Content,
                    CreatedAt = DateTime.UtcNow,
                    ReviewerId = userId,
                    Rate = data.Rate,
                    Id = Guid.NewGuid(),
                };
                await _unitOfWork.Reviews.AddAsync(review);

                // Save images
                foreach (var image in data.Images)
                {
                    string storedImageUrl = await _storageService.SaveImage(image)
                        ?? throw new InternalServerErrorException("Lưu ảnh thất bại.");
                    await _unitOfWork.Reviews.AddReviewMedia(review.Id, storedImageUrl, Enums.MediaType.Image);
                }

                await _unitOfWork.CommitTransactionAsync();
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }

            return new ApiSuccessResult("Đánh giá thành công");
        }

        public async Task<ApiResult<BoughtBookListItemDTO[]>> GetBoughtBook(ClaimsPrincipal claims)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            return new ApiSuccessResult<BoughtBookListItemDTO[]>(await _unitOfWork.Books.GetBoughtBooks(userId));
        }
        #endregion

        #region Category
        public async Task<ApiResult> CreateCategory(CategoryDTO data)
        {
            var cateRepo = _unitOfWork.Categories;

            if (await cateRepo.ExistsAsync(e => e.Name == data.Name))
                throw new BadRequestException("Tên danh mục đã tồn tại.");

            // If this book has parent, the parent must exist
            if (data.ParentId != null && !await cateRepo.ExistsAsync(e => e.Id == data.ParentId))
            {
                throw new BadRequestException("Danh mục cha không tồn tại.");
            }

            if (data.Thumbnail == null)
                throw new BadRequestException("Danh mục cần có ảnh minh họa.");

            var category = new Category
            {
                Name = data.Name,
                ParentId = data.ParentId,
                Thumbnail = await _storageService.SaveImage(data.Thumbnail)
                    ?? throw new InternalServerErrorException("Lưu ảnh danh mục thất bại."),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await cateRepo.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();
            return new ApiSuccessResult("Tạo danh mục mới thành công.");
        }

        public async Task<ApiResult> DeleteCategory(int id)
        {
            var cateRepo = _unitOfWork.Categories;

            var category = await cateRepo.GetFirstAsync(e => e.Id == id)
                ?? throw new BadRequestException("Danh mục không tồn tại.");

            if (await cateRepo.HasBookInCate(category.Id))
                throw new BadRequestException("Danh mục đang được dùng, không thể xóa");

            await cateRepo.DeleteAsync(category);
            await _unitOfWork.SaveChangesAsync();

            if (!await _storageService.RemoveImage(category.Thumbnail))
                throw new InternalServerErrorException("Xóa ảnh danh mục thất bại.");

            return new ApiSuccessResult("Xóa danh mục thành công");
        }

        public async Task<ApiResult<CategoryListItemDTO[]>> GetCategoriesAsListItem()
        {
            var categories = await _unitOfWork.Categories.GetAllAsync(
                predicate: e => true,
                selector: e => new CategoryListItemDTO
                {
                    Id = e.Id,
                    Name = e.Name,
                    ParentId = e.ParentId,
                    Thumbnail = e.Thumbnail,
                    CreatedAt = e.CreatedAt,
                    UpdatedAt = e.UpdatedAt,
                    ParentName = e.Parent != null ? e.Parent.Name : null
                },
                orderBy: e => e.Name);
            return new ApiSuccessResult<CategoryListItemDTO[]>(categories.ToArray());
        }

        public async Task<ApiResult<CategorySelectItemDTO[]>> GetCategoriesAsSelectItem()
        {
            var categories = await _unitOfWork.Categories.GetAllAsync(
                predicate: e => true,
                selector: e => new CategorySelectItemDTO
                {
                    Id = e.Id,
                    Name = e.Name,
                },
                orderBy: e => e.Name);
            return new ApiSuccessResult<CategorySelectItemDTO[]>(categories.ToArray());
        }

        public async Task<ApiResult> UpdateCategory(int id, CategoryDTO data)
        {
            var cateRepo = _unitOfWork.Categories;

            var category = await cateRepo.GetFirstAsync(e => e.Id == id)
                ?? throw new BadRequestException("Danh mục không tồn tại.");
            if (data.ParentId != null &&
                !await cateRepo.ExistsAsync(e => e.Id == data.ParentId))
                throw new BadRequestException("Danh mục cha không tồn tại.");

            // update
            category.Name = data.Name;
            category.ParentId = data.ParentId;
            if (data.Thumbnail != null)
            {
                if (!await _storageService.RemoveImage(category.Thumbnail))
                    throw new InternalServerErrorException("Xóa ảnh danh mục thất bại.");
                category.Thumbnail = await _storageService.SaveImage(data.Thumbnail)
                    ?? throw new InternalServerErrorException("Lưu ảnh mới cho danh mục thất bại.");
            }
            category.UpdatedAt = DateTime.UtcNow;
            await cateRepo.UpdateAsync(category);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult("Cập nhật danh mục thành công.");
        }

        public async Task<ApiResult<CategoryListItemDTO[]>> GetTopCategories(int count = 12)
        {
            return new ApiSuccessResult<CategoryListItemDTO[]>(
                await _unitOfWork.Categories.GetTopSell(count));
        }

        public async Task<ApiResult<BookListItemDTO[]>> GetTopSellBooks(int count = 12)
        {
            return new ApiSuccessResult<BookListItemDTO[]>(
                await _unitOfWork.Books.GetTopSell(count));
        }

        public async Task<ApiResult<BookListItemDTO[]>> GetNewestBooks(int count = 12)
        {
            return new ApiSuccessResult<BookListItemDTO[]>(
                await _unitOfWork.Books.GetNewest(count));
        }

        public async Task<ApiResult<BookListItemDTO[]>> GetRandomBooks(int count = 12)
        {
            return new ApiSuccessResult<BookListItemDTO[]>(
                await _unitOfWork.Books.GetRandom(count));
        }

        #endregion

        #region Book Review
        public async Task<ApiResult<BookToReviewListItemDTO[]>> GetListBookToReview(string orderId, ClaimsPrincipal claims)
        {
            var books = await _unitOfWork.Repository<OrderDetail>().GetAllAsync(
                predicate: e => e.OrderId == orderId,
                selector: e => new BookToReviewListItemDTO
                {
                    BookId = e.BookId,
                    BookName = e.BookName,
                    Price = e.Price,
                    Quantity = e.Quantity,
                    Cover = e.Book.Cover
                });
            return new ApiSuccessResult<BookToReviewListItemDTO[]>(books.ToArray());
        }

        public async Task<ApiResult<BookReviewListItemDTO[]>> GetListBookReviews(string bookId, PagingBookReviewRequestDTO data)
        {
            if (!await _unitOfWork.Books.ExistsAsync(e => e.Id.ToString() == bookId)) {
                throw new BadRequestException("Sách không tồn tại.");
            }

            var books = await _unitOfWork.Repository<Review>().GetAllAsync(
                predicate: e => e.BookId.ToString() == bookId,
                selector: e => new BookReviewListItemDTO
                {
                    UserId = e.ReviewerId,
                    Content = e.Content,
                    CreatedAt = e.CreatedAt,
                    Rate = e.Rate,
                    ImageUrls = e.ReviewMedias.Select(e => e.SourceUrl).ToArray(),
                    UserAvatarUrl = e.Reviewer.AvatarUrl!,
                    UserName = e.Reviewer.UserName
                },
                pageIndex: data.PageIndex,
                pageSize: data.PageSize,
                orderBy: e => e.CreatedAt,
                asc: false);

            return new ApiSuccessResult<BookReviewListItemDTO[]>(books.ToArray());
        }

        #endregion
    }
}
