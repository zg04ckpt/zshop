using Core.DTOs.Common;
using Core.DTOs.User;
using Core.Entities.System;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Utilities;
using LinqKit;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Core.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStorageService _storageService;
        private readonly IVNAddressDataService _vnAddressDataService;

        public UserService(
            IUnitOfWork unitOfWork, 
            IStorageService storageService, 
            IVNAddressDataService vnAddressDataService)
        {
            _unitOfWork = unitOfWork;
            _storageService = storageService;
            _vnAddressDataService = vnAddressDataService;
        }


        #region Profile
        public async Task<ApiResult<UserProfileDTO>> GetProfile(ClaimsPrincipal claims)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var user = await _unitOfWork.Users.GetFirstAsync(e => e.Id == userId)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            return new ApiSuccessResult<UserProfileDTO>(new UserProfileDTO
            {
                LastName = user.LastName,
                FirstName = user.FirstName,
                Email = user.Email,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                PhoneNumber = user.PhoneNumber,
                UserName = user.UserName,
                AvatarUrl = user.AvatarUrl
            });
        }

        public async Task<ApiResult> UpdateProfile(ClaimsPrincipal claims, UpdateUserProfileDTO data)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var user = await _unitOfWork.Users.GetFirstAsync(e => e.Id == userId)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            user.LastName = data.LastName.Trim();
            user.FirstName = data.FirstName.Trim();

            if (user.Email != data.Email)
            {
                // Confirm email
                user.Email = data.Email;
            }

            user.Gender = data.Gender;
            user.PhoneNumber = data.PhoneNumber;
            user.DateOfBirth = data.DateOfBirth;

            // Update user avatar
            if (data.NewAvatar != null)
            {
                if (user.AvatarUrl != null)
                {
                    if (!await _storageService.RemoveImage(user.AvatarUrl))
                        throw new InternalServerErrorException("Lưu ảnh thất bại");
                }
                user.AvatarUrl = await _storageService.SaveImage(data.NewAvatar)
                    ?? throw new InternalServerErrorException("Lưu ảnh thất bại");
            }

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult("Cập nhật thành công.");
        }

        #endregion

        #region Shipping Address
        public async Task<ApiResult> AddAddress(ClaimsPrincipal claims, AddressDTO data)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var user = await _unitOfWork.Users.GetFirstAsync(e => e.Id == userId)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            if (!_vnAddressDataService.IsValidCity(data.City, data.CityCode))
                throw new BadRequestException("Tỉnh/Thành phố không hợp lệ.");

            if (!_vnAddressDataService.IsValidDistrict(data.District, data.DistrictCode))
                throw new BadRequestException("Quận/huyện không hợp lệ.");

            if (!_vnAddressDataService.IsValidWard(data.Ward, data.WardCode))
                throw new BadRequestException("Phường/xã/thị không hợp lệ.");

            var address = new Address
            {
                Id = Guid.NewGuid(),
                City = data.City,
                District = data.District,
                Ward = data.Ward,
                UserId = user.Id,
                Detail = data.Detail.Trim(),
                PhoneNumber = data.PhoneNumber,
                ReceiverName = data.ReceiverName.Trim()
            };

            // if user not set default address => set this is default
            if (user.DefaultAddressId == null)
            {
                user.DefaultAddressId = address.Id;
                await _unitOfWork.Users.UpdateAsync(user);
            }

            await _unitOfWork.Repository<Address>().AddAsync(address);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult("Thêm địa chỉ thành công");
        }

        public async Task<ApiResult<List<AddressItemDTO>>> GetAddresses(ClaimsPrincipal claims)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var user = await _unitOfWork.Users.GetFirstAsync(e => e.Id == userId)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            var addresses = await _unitOfWork.Repository<Address>().GetAllAsync(
                predicate: e => e.UserId == user.Id,
                selector: e => new AddressItemDTO
                {
                    Id = e.Id.ToString(),
                    City = e.City,
                    District = e.District,
                    Ward = e.Ward,
                    Detail = e.Detail,
                    PhoneNumber = e.PhoneNumber,
                    ReceiverName = e.ReceiverName,
                    IsDefault = user.DefaultAddressId == e.Id
                });

            return new ApiSuccessResult<List<AddressItemDTO>>(addresses.ToList());
        }

        public async Task<ApiResult> RemoveAddress(ClaimsPrincipal claims, string addressId)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var user = await _unitOfWork.Users.GetFirstAsync(e => e.Id == userId)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            var address = await _unitOfWork.Repository<Address>().GetFirstAsync(e => e.Id.ToString() == addressId)
                ?? throw new BadRequestException("Địa chỉ không tồn tại.");

            if (address.UserId != user.Id)
                throw new ForbbidenException();

            if (user.DefaultAddressId == address.Id)
                throw new BadRequestException("Không thể xóa địa chỉ mặc định.");

            await _unitOfWork.Repository<Address>().DeleteAsync(address);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult("Xóa địa chỉ thành công.");
        }

        public async Task<ApiResult> SetDefaultAddress(ClaimsPrincipal claims, string addressId)
        {
            var userId = Guid.Parse(Helper.GetUserIdFromClaims(claims)!);
            var user = await _unitOfWork.Users.GetFirstAsync(e => e.Id == userId)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            var address = await _unitOfWork.Repository<Address>().GetFirstAsync(e => e.Id.ToString() == addressId)
                ?? throw new BadRequestException("Địa chỉ không tồn tại.");

            if (address.UserId != user.Id)
                throw new ForbbidenException();

            user.DefaultAddressId = address.Id;
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult("Thay đổi địa chỉ mặc định thành công");
        }

        #endregion

        #region Management
        public async Task<ApiResult<Paginated<UserItemDTO>>> GetUsersAsList(SearchUserDTO data)
        {
            // filter
            var filter = PredicateBuilder.New<User>(true);
            if (data.Name != null)
                filter.And(e => e.LastName.Contains(data.Name) || e.FirstName.Contains(data.Name));
            if (data.Email != null)
                filter.And(e => e.Email.Contains(data.Email));
            if (data.UserName != null)
                filter.And(e => e.UserName.Contains(data.UserName));
            if (data.RoleId != -1)
                filter.And(e => e.UserRoles.Any(ur => ur.RoleId == data.RoleId));
            filter.And(e => e.IsActivated == data.IsActivated);

            var users = await _unitOfWork.Repository<User>().GetPagingAsync(
                predicate: filter,
                pageIndex: data.PageIndex,
                pageSize: data.PageSize,
                orderBy: e => e.FirstName,
                asc: true,
                selector: e => new UserItemDTO
                {
                    Id = e.Id,
                    FullName = e.LastName + " " + e.FirstName,
                    Email = e.Email,
                    IsActivated = e.IsActivated,
                    LastLogin = e.LastLogin,
                    Gender = e.Gender,
                    PhoneNumber = e.PhoneNumber,
                    UserName = e.UserName,
                    Roles = e.UserRoles.Select(e => e.Role.Name).ToArray(),
                });

            return new ApiSuccessResult<Paginated<UserItemDTO>>(users);
        }

        public async Task<ApiResult<RoleSelectItemDTO[]>> GetRoles()
        {
            var roles = await _unitOfWork.Repository<Role>().GetAllAsync(
                predicate: e => true,
                selector: e => new RoleSelectItemDTO
                {
                    Id = e.Id,
                    Name = e.Name
                });
            return new ApiSuccessResult<RoleSelectItemDTO[]>(roles.ToArray());
        }
        #endregion
    }
}
