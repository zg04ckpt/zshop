using Core.DTOs.Auth;
using Core.DTOs.Common;
using Core.Exceptions;
using Core.Mappers;
using Core.Repositories;
using Core.Utilities;
using Data.Entities.System;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Core.Services.Impl
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository userRepository;
        private readonly IJwtService jwtService;
        private readonly IGenderRepository genderRepository;
        private readonly IConfiguration configuration;
        private readonly UserMapper userMapper;

        public AuthService(IUserRepository userRepository, IGenderRepository genderRepository, IJwtService jwtService, IConfiguration configuration)
        {
            this.userRepository = userRepository;
            this.userMapper = new UserMapper();
            this.genderRepository = genderRepository;
            this.jwtService = jwtService;
            this.configuration = configuration;
        }

        public Task<ApiResult> ConfirmEmail(string userId, string token)
        {
            throw new NotImplementedException();
        }

        public async Task<ApiResult<LoginResponseDTO>> LogIn(LoginDTO data)
        {
            // Check valid
            User user = await userRepository.Get(e => e.Email.Equals(data.Email))
                ?? throw new BadRequestException("Email không tồn tại");

            // Limit incorrect password times
            var maxFailCount = int.Parse(configuration.GetSection("AuthConfig")["MaxFailedAttempts"]);
            if (user.AccessFailedCount > maxFailCount)
                throw new BadRequestException($"Sai mật khẩu quá {maxFailCount} lần liên tiếp, vui kiểm tra email của bạn để mở khóa!");
            if (!Hasher.HashPassword(data.Password).Equals(user.Password))
            {
                user.AccessFailedCount++;
                userRepository.Update(user);
                await userRepository.Save();
                throw new BadRequestException($"Mật khẩu không chính xác, còn {maxFailCount - user.AccessFailedCount} lần thử!");
            }

            // Reset incorrect password times if login success
            user.AccessFailedCount = 0;
            userRepository.Update(user);
            await userRepository.Save();

            // Create JWT token
            List<string> roles = (await userRepository.GetRolesOfUser(user.Id)).Select(e => e.Name).ToList();
            JwtTokenDTO token = jwtService.IssueToken(user, roles);

            return new ApiSuccessResult<LoginResponseDTO>(new LoginResponseDTO
            {
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                Token = token,
                Roles = roles
            });
        }

        public Task<ApiResult> LogOut(ClaimsPrincipal claims)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResult<JwtTokenDTO>> RefreshAccessToken(string accessToken, string refreshToken)
        {
            throw new NotImplementedException();
        }

        public async Task<ApiResult> Register(RegisterDTO data)
        {
            // check duplication 
            if (await userRepository.IsExists(e => e.UserName.ToLower() == data.UserName.ToLower()))
                throw new BadRequestException("Tên người dùng đã tồn tại");
            if (await userRepository.IsExists(e => e.Email.ToLower() == data.Email.ToLower()))
                throw new BadRequestException("Email đã được sử dụng");
            if (await userRepository.IsExists(e => e.PhoneNumber == data.PhoneNumber))
                throw new BadRequestException("Số điện thoại đã được sử dụng");

            // create new user with role user
            User user = userMapper.MapFrom(data);
            user.GenderId = (await genderRepository.Get(e => e.Value.ToLower() == "unset"))!.Id;
            await userRepository.Add(user);
            await userRepository.AddUserRoles(user, "User");

            // save when success all
            await userRepository.Save();
            return new ApiSuccessResult("Đăng kí tài khoản thành công");
        }
    }
}
