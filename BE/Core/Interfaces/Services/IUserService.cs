using Core.DTOs.Common;
using Core.DTOs.User;
using System.Security.Claims;

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
        Task<ApiResult> RemoveAddress(ClaimsPrincipal claims, string addressId);
        Task<ApiResult> SetDefaultAddress(ClaimsPrincipal claims, string addressId);

        // Management
        Task<ApiResult<Paginated<UserItemDTO>>> GetUsersAsList(SearchUserDTO data);
        Task<ApiResult> SetUserActive(SetUserActiveDTO data);
        Task<ApiResult> DeleteUser(Guid userId);
        Task<ApiResult<RoleSelectItemDTO[]>> GetRoles();
    }
}
