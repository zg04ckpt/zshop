using Core.DTOs.Cart;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v1/cart")]
    [ApiController]
    [Authorize]
    public class CartsController : ControllerBase
    {
        private readonly ICartService _cartService;
        public CartsController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            return Ok(await _cartService.GetCart(User));
        }

        [HttpPost("pay")]
        public async Task<IActionResult> PayCart([FromBody] PayCartDTO data)
        {
            return Ok(await _cartService.PayCart(data, User));
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddItemToCart([FromBody] AddItemToCartDTO data)
        {
            return Ok(await _cartService.AddItemToCart(User, data));
        }

        [HttpDelete("items/{bookId}")]
        public async Task<IActionResult> RemoveItemFromCart(string bookId)
        {
            return Ok(await _cartService.RemoveItemFromCart(User, bookId));
        }
    }
}
