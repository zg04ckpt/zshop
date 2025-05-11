using Core.DTOs.Common;
using Core.DTOs.User;
using Core.Entities.System;
using Core.Exceptions;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Utilities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Core.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly IStorageService _storageService;
        private readonly IRoleRepository _roleRepository;
        private readonly IVNAddressDataService _vnAddressDataService;

        public UserService(IUserRepository userRepository, IStorageService storageService, IAddressRepository addressRepository, IVNAddressDataService vnAddressDataService, IRoleRepository roleRepository)
        {
            _userRepository = userRepository;
            _storageService = storageService;
            _addressRepository = addressRepository;
            _vnAddressDataService = vnAddressDataService;
            _roleRepository = roleRepository;
        }

        #region Profile

        public async Task<ApiResult<UserProfileDTO>> GetProfile(ClaimsPrincipal claims)
        {
            var user = await _userRepository.Get(Guid.Parse(Helper.GetUserIdFromClaims(claims)!))
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
            var user = await _userRepository.Get(Guid.Parse(Helper.GetUserIdFromClaims(claims)!))
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

            _userRepository.Update(user);
            await _userRepository.Save();

            return new ApiSuccessResult("Cập nhật thành công.");
        }

        #endregion

        #region Shipping Address
        public async Task<ApiResult> AddAddress(ClaimsPrincipal claims, AddressDTO data)
        {
            var user = await _userRepository.Get(Guid.Parse(Helper.GetUserIdFromClaims(claims)!))
                ?? throw new BadRequestException("Người dùng không tồn tại.");

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
                _userRepository.Update(user);
            }

            await _addressRepository.Add(address);
            await _addressRepository.Save();

            return new ApiSuccessResult("Thêm địa chỉ thành công");
        }

        public async Task<ApiResult<List<AddressItemDTO>>> GetAddresses(ClaimsPrincipal claims)
        {
            var user = await _userRepository.Get(Guid.Parse(Helper.GetUserIdFromClaims(claims)!))
                ?? throw new BadRequestException("Người dùng không tồn tại");

            var addresses = await _addressRepository.GetQuery().AsNoTracking()
                .Where(e => e.UserId == user.Id)
                .Select(e => new AddressItemDTO
                {
                    Id = e.Id.ToString(),
                    City = e.City,
                    District = e.District,
                    Ward = e.Ward,
                    Detail = e.Detail,
                    PhoneNumber = e.PhoneNumber,
                    ReceiverName = e.ReceiverName,
                    IsDefault = user.DefaultAddressId == e.Id
                })
                .ToListAsync();

            return new ApiSuccessResult<List<AddressItemDTO>>(addresses);
        }

        public async Task<ApiResult> RemoveAddress(ClaimsPrincipal claims, string addressId)
        {
            var user = await _userRepository.Get(Guid.Parse(Helper.GetUserIdFromClaims(claims)!))
                ?? throw new BadRequestException("Người dùng không tồn tại");
            var address = await _addressRepository.Get(Guid.Parse(addressId))
                ?? throw new BadRequestException("Địa chỉ không tồn tại.");

            if (address.UserId != user.Id)
                throw new ForbbidenException();

            if (user.DefaultAddressId == address.Id)
                throw new BadRequestException("Không thể xóa địa chỉ mặc định.");

            _addressRepository.Delete(address);
            await _addressRepository.Save();

            return new ApiSuccessResult("Xóa địa chỉ thành công.");
        }

        public async Task<ApiResult> SetDefaultAddress(ClaimsPrincipal claims, string addressId)
        {
            var user = await _userRepository.Get(Guid.Parse(Helper.GetUserIdFromClaims(claims)!))
                ?? throw new BadRequestException("Người dùng không tồn tại");

            var address = await _addressRepository.Get(Guid.Parse(addressId))
                ?? throw new BadRequestException("Địa chỉ không tồn tại.");

            if (address.UserId != user.Id)
                throw new ForbbidenException();

            user.DefaultAddressId = address.Id;
            _userRepository.Update(user);
            await _userRepository.Save();

            return new ApiSuccessResult("Thay đổi địa chỉ mặc định thành công");
        }

        #endregion

        #region Management
        public async Task<ApiResult<Paginated<UserItemDTO>>> GetUsersAsList(SearchUserDTO data)
        {
            var query = _userRepository.GetQuery().AsNoTracking();

            // filter
            query = query.Include(e => e.UserRoles).ThenInclude(e => e.Role);

            if (data.Name != null)
                query = query.Where(e => e.LastName.Contains(data.Name) || e.FirstName.Contains(data.Name));

            if (data.Email != null)
                query = query.Where(e => e.Email.Contains(data.Email));

            if (data.UserName != null)
                query = query.Where(e => e.UserName.Contains(data.UserName));

            if (data.RoleId != -1)
                query = query.Where(e => e.UserRoles.Any(ur => ur.RoleId == data.RoleId));

            query = query.Where(e => e.IsActivated == data.IsActivated);


            // paging
            int totalRecord = await query.CountAsync();
            int totalPage = (int)Math.Ceiling((double)totalRecord / data.Size);
            var users = await query
                .Skip((data.Page - 1) * data.Size)
                .Take(data.Size)
                .Select(e => new UserItemDTO
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
                })
                .ToArrayAsync();

            return new ApiSuccessResult<Paginated<UserItemDTO>>(new Paginated<UserItemDTO>
            {
                TotalRecord = totalRecord,
                TotalPage = totalPage,
                Data = users
            });
        }

        public async Task<ApiResult<RoleSelectItemDTO[]>> GetRoles()
        {
            return new ApiSuccessResult<RoleSelectItemDTO[]>(await _roleRepository
                .GetAll().Select(e => new RoleSelectItemDTO
                {
                    Id = e.Id,
                    Name = e.Name
                }).ToArrayAsync());
        }



        #endregion
    }
}
