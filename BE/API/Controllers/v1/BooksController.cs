using Core.DTOs.Book;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v1/books")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
        }

        [HttpGet]
        public async Task<IActionResult> GetBooksAsListItem([FromQuery] BookSearchDTO data)
        {
            return Ok(await _bookService.GetBooksAsListItem(data));
        }

        [HttpGet("top-sell")]
        public async Task<IActionResult> GetTopSellBooks()
        {
            return Ok(await _bookService.GetTopSellBooks());
        }

        [HttpGet("newest")]
        public async Task<IActionResult> GetNewestBooks()
        {
            return Ok(await _bookService.GetNewestBooks());
        }

        [HttpGet("explorer")]
        public async Task<IActionResult> GetRandoBooks()
        {
            return Ok(await _bookService.GetRandomBooks());
        }

        [HttpGet("purchased")]
        [Authorize]
        public async Task<IActionResult> GetBoughtBooks()
        {
            return Ok(await _bookService.GetBoughtBook(User));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookDetail(string id)
        {
            return Ok(await _bookService.GetBookDetail(id));
        }

        [HttpGet("{id}/reviews")]
        public async Task<IActionResult> GetBookReviews(string id, [FromQuery] PagingBookReviewRequestDTO data)
        {
            return Ok(await _bookService.GetListBookReviews(id, data));
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategoriesAsListItem()
        {
            return Ok(await _bookService.GetCategoriesAsListItem());
        }

        [HttpGet("categories/top-sell")]
        public async Task<IActionResult> GetTopSellCate()
        {
            return Ok(await _bookService.GetTopCategories());
        }

        [HttpPost("review")]
        [Authorize]
        public async Task<IActionResult> CreateBookReview([FromForm] CreateBookReviewDTO data)
        {
            return Ok(await _bookService.ReviewBook(data, User));
        }

        // Auto
        
    }
}
