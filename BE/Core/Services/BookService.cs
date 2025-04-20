using Core.DTOs.Book;
using Core.DTOs.Common;
using Core.Entities.BookFeature;
using Core.Exceptions;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Utilities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace Core.Services
{
    public class BookService : IBookService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IBookRepository _bookRepository;
        private readonly IReviewRepository _reviewRepository;
        private readonly IOrderDetailRepository _orderDetailRepository;
        private readonly IStorageService _storageService;

        public BookService(
            ICategoryRepository categoryRepository,
            IStorageService storageService,
            IBookRepository bookRepository,
            IOrderDetailRepository orderDetailRepository,
            IReviewRepository reviewRepository)
        {
            _categoryRepository = categoryRepository;
            _storageService = storageService;
            _bookRepository = bookRepository;
            _orderDetailRepository = orderDetailRepository;
            _reviewRepository = reviewRepository;
        }

        #region Book
        public async Task<ApiResult> CreateBook(BookDTO data)
        {
            if (await _bookRepository.IsExists(e => e.Name == data.Name))
                throw new BadRequestException("Tên đã tồn tại.");
            if (data.CategoryIds.Length > 3)
                throw new BadRequestException("Chọn tối đa 3 danh mục.");

            // Add cover
            if (data.Cover is null)
                throw new BadRequestException("Vui lòng cung cấp ảnh bìa.");
            if (data.CategoryIds.Length == 0)
                throw new BadRequestException("Vui lòng thêm ít nhất 1 danh mục thể loại.");

            var book = new Book
            {
                Id = Guid.NewGuid(),
                Name = data.Name,
                Author = data.Author,
                Currency = "VNĐ",
                AvgRate = 0,
                Cover = await _storageService.SaveImage(data.Cover)
                ?? throw new InternalServerErrorException("Lưu ảnh bìa thất bại"),
                Description = data.Description,
                Language = data.Language,
                Price = data.Price,
                PublishDate = data.PublishDate,
                StockCount = data.Stock,
                SoldCount = 0,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };

            await _bookRepository.Add(book);
            await _bookRepository.AddToCategory(book.Id, data.CategoryIds);
            await _bookRepository.Save();

            return new ApiSuccessResult("Tạo sách mới thành công.");
        }

        public async Task<ApiResult> UpdateBook(string id, BookDTO data)
        {
            var book = await _bookRepository.Get(Guid.Parse(id))
                ?? throw new BadRequestException("Sách không tồn tại.");
            if (data.CategoryIds.Length > 3)
                throw new BadRequestException("Chọn tối đa 3 danh mục.");

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
            book.UpdatedAt = DateTime.Now;
            book.Author = data.Author;
            book.PublishDate = data.PublishDate;
            book.Language = data.Language;
            book.Price = data.Price;
            book.Description = data.Description;
            book.StockCount = data.Stock;

            _bookRepository.Update(book);
            await _bookRepository.UpdateCategory(book.Id, data.CategoryIds);
            await _bookRepository.Save();

            return new ApiSuccessResult("Cập nhật sách thành công.");
        }

        public async Task<ApiResult> DeleteBook(string id)
        {
            var book = await _bookRepository.Get(Guid.Parse(id))
                ?? throw new BadRequestException("Sách không tồn tại.");

            _bookRepository.Delete(book);
            await _bookRepository.Save();

            if (!await _storageService.RemoveImage(book.Cover))
                throw new InternalServerErrorException("Xóa ảnh bìa thất bại.");

            return new ApiSuccessResult("Xóa sách thành công.");
        }

        public async Task<ApiResult<Paginated<BookListItemDTO>>> GetBooksAsListItem(BookSearchDTO data)
        {
            var query = _bookRepository.GetQuery().AsNoTracking();

            // filter
            if (!string.IsNullOrEmpty(data.Name))
                query = query.Where(e => e.Name.Contains(data.Name));
            if (data.MinPrice != null)
                query = query.Where(e => e.Price >= data.MinPrice);
            if (data.MaxPrice != null)
                query = query.Where(e => e.Price <= data.MaxPrice);
            if (data.CategoryIds?.Length > 0)
            {
                query = query.Where(book =>
                    book.BookCategories.Count(bc => data.CategoryIds.Contains(bc.CategoryId)) == data.CategoryIds.Length);
            }

            var totalRecords = await query.CountAsync();

            // sorting
            data.SortBy = Helper.ConvertToValidPropName(data.SortBy);
            if (data.Order.ToLower() == "asc")
                query = query.OrderBy(e => EF.Property<object>(e, data.SortBy));
            else
                query = query.OrderByDescending(e => EF.Property<object>(e, data.SortBy));

            // Paging & Projection
            var books = await query
                .Skip((data.Page - 1) * data.Size)
                .Take(data.Size)
                .Select(book => new BookListItemDTO
                {
                    Id = book.Id,
                    Name = book.Name,
                    Currency = book.Currency,
                    AvgRate = book.AvgRate,
                    Price = book.Price,
                    SoldCount = book.SoldCount,
                    Cover = book.Cover,
                    UpdatedAt = book.UpdatedAt,
                    Categories = book.BookCategories.Select(e => e.Category.Name).ToArray()
                })
                .ToArrayAsync();

            var totalPage = (int)Math.Ceiling((double)totalRecords / data.Size);
            return new ApiSuccessResult<Paginated<BookListItemDTO>>(new Paginated<BookListItemDTO>
            {
                TotalPage = totalPage,
                TotalRecord = totalRecords,
                Data = books
            });
        }

        public async Task<ApiResult<BookDetailDTO>> GetBookDetail(string id)
        {
            var book = await _bookRepository.GetQuery().AsNoTracking()
                .Where(e => e.Id.ToString() == id)
                .Select(book => new BookDetailDTO
                {
                    Id = book.Id,
                    Name = book.Name,
                    Author = book.Author,
                    Currency = book.Currency,
                    AvgRate = book.AvgRate,
                    Description = book.Description,
                    Language = book.Language,
                    Price = book.Price,
                    StockCount = book.StockCount,
                    Categories = book.BookCategories.Select(e => e.Category.Name).ToArray(),
                    PublishDate = book.PublishDate.ToString("dd/MM/yyyy"),
                    SoldCount = book.SoldCount,
                    Cover = book.Cover,
                    CreatedAt = book.CreatedAt, 
                    UpdatedAt = book.UpdatedAt,
                })
                .FirstOrDefaultAsync()
                ?? throw new BadRequestException("Sách không tồn tại.");

            return new ApiSuccessResult<BookDetailDTO>(book);
        }

        public async Task<ApiResult> ReviewBook(CreateBookReviewDTO data, ClaimsPrincipal claims)
        {
            // Only user bought this book can review it.
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            if (!await _orderDetailRepository.IsExists(
                e => e.BookId == data.BookId && 
                e.Order.CustomerId == userId))
            {
                throw new BadRequestException("Vui lòng mua sản phẩm để đánh giá.");
            }
            var book = await _bookRepository.Get(data.BookId)
                ?? throw new BadRequestException("Sách không tồn tại.");

            // Check valid rating
            if (data.Rate > 5 || data.Rate < 1)
            {
                throw new BadRequestException("Vui đánh giá từ 1 - 5 sao.");
            }

            // Review
            var review = new Review
            {
                BookId = data.BookId,
                Content = data.Content,
                CreatedAt = DateTime.Now,
                ReviewerId = userId,
                Rate = data.Rate,
                Id = Guid.NewGuid(),
            };
            await _reviewRepository.Add(review);

            // Save images
            foreach (var image in data.Images)
            {
                string storedImageUrl = await _storageService.SaveImage(image)
                    ?? throw new InternalServerErrorException("Lưu ảnh thất bại.");
                await _reviewRepository.AddReviewMedia(review.Id, storedImageUrl, Enums.MediaType.Image);
            }
            await _reviewRepository.Save();

            return new ApiSuccessResult("Đánh giá thành công");
        }


        public async Task<ApiResult<BoughtBookListItemDTO[]>> GetBoughtBook(ClaimsPrincipal claims)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            return new ApiSuccessResult<BoughtBookListItemDTO[]>(
                await _bookRepository.GetBoughtBooks(userId));
        }
        #endregion

        #region Category
        public async Task<ApiResult> CreateCategory(CategoryDTO data)
        {
            if (await _categoryRepository.IsExists(e => e.Name == data.Name))
                throw new BadRequestException("Tên danh mục đã tồn tại.");

            // If this book has parent, the parent must exist
            if (
                data.ParentId != null &&
                !await _categoryRepository.IsExists(e => e.Id == data.ParentId))
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
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };

            await _categoryRepository.Add(category);
            await _categoryRepository.Save();
            return new ApiSuccessResult("Tạo danh mục mới thành công.");
        }

        public async Task<ApiResult> DeleteCategory(int id)
        {
            var category = await _categoryRepository.Get(e => e.Id == id)
                ?? throw new BadRequestException("Danh mục không tồn tại.");

            if (await _categoryRepository.HasBookInCate(category.Id))
                throw new BadRequestException("Danh mục đang được dùng, không thể xóa");

            _categoryRepository.Delete(category);
            await _categoryRepository.Save();

            if (!await _storageService.RemoveImage(category.Thumbnail))
                // Need write to log
                throw new InternalServerErrorException("Xóa ảnh danh mục thất bại.");

            return new ApiSuccessResult("Xóa danh mục thành công");
        }

        public async Task<ApiResult<CategoryListItemDTO[]>> GetCategoriesAsListItem()
        {
            return new ApiSuccessResult<CategoryListItemDTO[]>(
                await _categoryRepository
                    .GetQuery().AsNoTracking()
                    .Select(e => new CategoryListItemDTO
                    {
                        Id = e.Id,
                        Name = e.Name,
                        ParentId = e.ParentId,
                        Thumbnail = e.Thumbnail,
                        CreatedAt = e.CreatedAt,
                        UpdatedAt = e.UpdatedAt,
                        ParentName = e.Parent != null ? e.Parent.Name : null
                    })
                    .OrderBy(e => e.Name)
                    .ToArrayAsync());
        }

        public async Task<ApiResult<CategorySelectItemDTO[]>> GetCategoriesAsSelectItem()
        {
            return new ApiSuccessResult<CategorySelectItemDTO[]>(
                await _categoryRepository.GetQuery().AsNoTracking()
                    .Select(e => new CategorySelectItemDTO
                    {
                        Id = e.Id,
                        Name = e.Name
                    })
                    .ToArrayAsync());
        }

        public async Task<ApiResult> UpdateCategory(int id, CategoryDTO data)
        {
            var category = await _categoryRepository.Get(e => e.Id == id)
                ?? throw new BadRequestException("Danh mục không tồn tại.");
            if (data.ParentId != null &&
                !await _categoryRepository.IsExists(e => e.Id == data.ParentId))
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
            category.UpdatedAt = DateTime.Now;
            _categoryRepository.Update(category);
            await _categoryRepository.Save();

            return new ApiSuccessResult("Cập nhật danh mục thành công.");
        }

        public async Task<ApiResult<CategoryListItemDTO[]>> GetTopCategories(int count = 12)
        {
            return new ApiSuccessResult<CategoryListItemDTO[]>(await _categoryRepository.GetTopSell(count));
        }

        public async Task<ApiResult<BookListItemDTO[]>> GetTopSellBooks(int count = 12)
        {
            return new ApiSuccessResult<BookListItemDTO[]>(await _bookRepository.GetTopSell(count));
        }

        public async Task<ApiResult<BookListItemDTO[]>> GetNewestBooks(int count = 12)
        {
            return new ApiSuccessResult<BookListItemDTO[]>(await _bookRepository.GetNewest(count));
        }



        #endregion

        #region Book Review
        public async Task<ApiResult<BookToReviewListItemDTO[]>> GetListBookToReview(string orderId, ClaimsPrincipal claims)
        {
            var books = await _orderDetailRepository.GetQuery().AsNoTracking()
                .Where(e => e.OrderId == orderId)
                .Select(e => new BookToReviewListItemDTO
                {
                    BookId = e.BookId,
                    BookName = e.BookName,
                    Price = e.Price,
                    Quantity = e.Quantity,
                    Cover = e.Book.Cover
                }).ToArrayAsync();
            return new ApiSuccessResult<BookToReviewListItemDTO[]>(books);
        }

        public async Task<ApiResult<BookReviewListItemDTO[]>> GetListBookReviews(string bookId, PagingBookReviewRequestDTO data)
        {
            if (!await _bookRepository.IsExists(e => e.Id.ToString() == bookId)) {
                throw new BadRequestException("Sách không tồn tại.");
            }

            var books = await _reviewRepository.GetQuery().AsNoTracking()
                .Where(e => e.BookId.ToString() == bookId)
                .OrderByDescending(e => e.CreatedAt)
                .Take(data.Size)
                .Skip((data.Page - 1) * data.Size)
                .Select(e => new BookReviewListItemDTO
                {
                    UserId = e.ReviewerId,
                    Content = e.Content,
                    CreatedAt = e.CreatedAt,
                    Rate = e.Rate,
                    ImageUrls = e.ReviewMedias.Select(e => e.SourceUrl).ToArray(),
                    UserAvatarUrl = e.Reviewer.AvatarUrl!,
                    UserName = e.Reviewer.UserName
                }).ToArrayAsync();

            return new ApiSuccessResult<BookReviewListItemDTO[]>(books);
        }

        #endregion
    }
}
