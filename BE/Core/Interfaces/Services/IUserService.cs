using Core.DTOs.Common;
using Core.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface IUserService
    {
        // Profile
        Task<ApiResult<UserProfileDTO>> GetProfile(ClaimsPrincipal claims);
        Task<ApiResult> UpdateProfile(ClaimsPrincipal claims, UpdateUserProfileDTO data);

        // Shipping address
        Task<ApiResult<List<AddressItemDTO>>> GetAddresses(ClaimsPrincipal claims);
        Task<ApiResult> AddAddress(ClaimsPrincipal claims, AddressDTO data);
        //Task<ApiResult> UpdateAddress(ClaimsPrincipal claims, string addressId, AddressDTO data);
        Task<ApiResult> RemoveAddress(ClaimsPrincipal claims, string addressId);
        Task<ApiResult> SetDefaultAddress(ClaimsPrincipal claims, string addressId);

        // Management
        Task<ApiResult<Paginated<UserItemDTO>>> GetUsersAsList(SearchUserDTO data);
        Task<ApiResult<RoleSelectItemDTO[]>> GetRoles();
    }
}
