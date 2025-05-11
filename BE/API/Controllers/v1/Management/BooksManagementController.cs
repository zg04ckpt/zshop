using Core.DTOs.Book;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1.Management
{
    [Route("api/v1/management/book")]
    [ApiController]
    [Authorize(Policy = "OnlyAdmin")]
    public class BooksManagementController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksManagementController(IBookService bookService)
        {
            _bookService = bookService;
        }

        [HttpGet]
        public async Task<IActionResult> GetBooksAsListItem([FromQuery]BookSearchDTO data)
        {
            return Ok(await _bookService.GetBooksAsListItem(data));
        }

        [HttpPost]
        public async Task<IActionResult> CreateBook([FromForm] BookDTO data)
        {
            return Ok(await _bookService.CreateBook(data));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(string id, [FromForm] BookDTO data)
        {
            return Ok(await _bookService.UpdateBook(id, data));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(string id)
        {
            return Ok(await _bookService.DeleteBook(id));
        }
        #region Category

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategoriesAsListItem()
        {
            return Ok(await _bookService.GetCategoriesAsListItem());
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateNewCategory([FromForm] CategoryDTO data)
        {
            return Ok(await _bookService.CreateCategory(data));
        }

        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromForm] CategoryDTO data)
        {
            return Ok(await _bookService.UpdateCategory(id, data));
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> RemoveCategory(int id)
        {
            return Ok(await _bookService.DeleteCategory(id));
        }

        #endregion
    }
}
