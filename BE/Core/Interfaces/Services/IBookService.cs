using Core.DTOs.Book;
using Core.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface IBookService
    {
        // Book
        Task<ApiResult> CreateBook(BookDTO data);
        Task<ApiResult<BookDetailDTO>> GetBookDetail(string id);
        Task<ApiResult> UpdateBook(string id, BookDTO data);
        Task<ApiResult> DeleteBook(string id);
        Task<ApiResult<Paginated<BookListItemDTO>>> GetBooksAsListItem(BookSearchDTO data);
        Task<ApiResult<BookListItemDTO[]>> GetTopSellBooks(int count = 12);
        Task<ApiResult<BookListItemDTO[]>> GetNewestBooks(int count = 12);
        Task<ApiResult> ReviewBook(CreateBookReviewDTO data, ClaimsPrincipal claims);
        Task<ApiResult<BoughtBookListItemDTO[]>> GetBoughtBook(ClaimsPrincipal claims);

        // Category
        Task<ApiResult<CategoryListItemDTO[]>> GetTopCategories(int count = 12);
        Task<ApiResult> CreateCategory(CategoryDTO data);
        Task<ApiResult> UpdateCategory(int id, CategoryDTO data);
        Task<ApiResult> DeleteCategory(int id);
        Task<ApiResult<CategoryListItemDTO[]>> GetCategoriesAsListItem();
        Task<ApiResult<CategorySelectItemDTO[]>> GetCategoriesAsSelectItem();

        // Book review
        Task<ApiResult<BookToReviewListItemDTO[]>> GetListBookToReview(string orderId, ClaimsPrincipal claims);
        Task<ApiResult<BookReviewListItemDTO[]>> GetListBookReviews(string bookId, PagingBookReviewRequestDTO data);
    }
}
