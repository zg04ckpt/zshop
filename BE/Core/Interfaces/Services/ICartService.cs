using Core.DTOs.Cart;
using Core.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface ICartService
    {
        Task<ApiResult<CartDTO>> GetCart(ClaimsPrincipal claims);
        Task<ApiResult> AddItemToCart(ClaimsPrincipal claims, AddItemToCartDTO data);
        Task<ApiResult> RemoveItemFromCart(ClaimsPrincipal claims, string bookId);
        Task<ApiResult<string>> PayCart(PayCartDTO data, ClaimsPrincipal claims);
    }
}
