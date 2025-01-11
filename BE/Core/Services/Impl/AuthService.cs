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
using System.Runtime.CompilerServices;
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
        private readonly IStorageService storageService;
        private readonly IConfiguration configuration;
        private readonly IRedisService redisService;
        private readonly IMailService mailService;
        private readonly UserMapper userMapper;

        public AuthService(IUserRepository userRepository, IGenderRepository genderRepository, IJwtService jwtService, IConfiguration configuration, IStorageService storageService, IRedisService redisService, IMailService mailService)
        {
            this.userRepository = userRepository;
            this.userMapper = new UserMapper();
            this.genderRepository = genderRepository;
            this.jwtService = jwtService;
            this.configuration = configuration;
            this.storageService = storageService;
            this.redisService = redisService;
            this.mailService = mailService;
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
            if (!Generator.HashPassword(data.Password).Equals(user.Password))
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
            JwtTokenDTO token = jwtService.IssueToken(user, roles, isLogin: true);

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

        public async Task<ApiResult> LogOut(string accessToken)
        {
            await jwtService.RevokeToken(accessToken);
            return new ApiSuccessResult("Đăng xuất thành công");
        }

        public async Task<ApiResult<JwtTokenDTO>> RefreshToken(TokenDTO data)
        {
            ClaimsPrincipal? claim = jwtService.ValidateAccessToken(data.AccessToken)
                ?? throw new UnauthorizedException("Access token không hợp lệ");

            // Get user data to issue new token set
            string userId = claim.FindFirstValue(ClaimTypes.NameIdentifier);
            User user = await userRepository.Get(Guid.Parse(userId))
                ?? throw new UnauthorizedException("Access token không hợp lệ");
            List<string> roles = (await userRepository.GetRolesOfUser(user.Id)).Select(e => e.Name).ToList();

            // Check refesh token valid
            if (!await jwtService.ValidateRefreshToken(userId, data.RefreshToken))
                throw new UnauthorizedException("Refresh token không hợp lệ");

            JwtTokenDTO token = jwtService.IssueToken(user, roles, isLogin: false);

            return new ApiSuccessResult<JwtTokenDTO>(token);
        }

        public async Task<ApiResult<RegisterResponseDTO>> Register(RegisterDTO data)
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

            // use 6 digits code to authenticate email
            if (!await AuthenticateUserEmail(user))
                throw new InternalServerErrorException("Đăng kí tài khoản thất bại, vui lòng thử lại.");

            // save when success all and response with created user id
            await userRepository.Save();
            return new ApiSuccessResult<RegisterResponseDTO>(
                "Đăng kí tài khoản thành công, vui lòng kiểm tra email đăng kí để lấy mã xác thực tài khoản.", 
                new RegisterResponseDTO { UserId = user.Id.ToString() });
        }

        public async Task<ApiResult> ResendConfirmEmailCode(string userId)
        {
            User user = await userRepository.Get(Guid.Parse(userId))
                ?? throw new BadRequestException("Người dùng không tồn tại");
            if (!await AuthenticateUserEmail(user))
                throw new InternalServerErrorException("Gửi thất bại, vui lòng thử lại.");

            return new ApiSuccessResult("Gửi thành công");
        }

        public async Task<ApiResult> ValidateEmailByCode(ConfirmEmailDTO data)
        {
            // validate code from redis
            string? validCode = await redisService.Get("authentication_email_code", data.UserId);
            if (validCode is null || validCode != data.Code)
                throw new BadRequestException("Mã xác thực không chính xác!");

            // update confirm email status
            User user = await userRepository.Get(Guid.Parse(data.UserId))
                ?? throw new BadRequestException("Người dùng không tồn tại");
            user.IsEmailComfirmed = true;
            userRepository.Update(user);
            await userRepository.Save();

            // remove code in redis
            await redisService.Delete("authentication_email_code", data.UserId);

            return new ApiSuccessResult("Xác thực email người dùng thành công.");
        }

        private async Task<bool> AuthenticateUserEmail(User user)
        {
            string authenticationCode = Generator.GenerateRandomToken(src: "0123456789", len: 6);
            int ttl = int.Parse(configuration.GetSection("AuthConfig")["AuthenticationCodeTTL"]);
            // Use redis to save authentication code
            bool saveStatus = await redisService.Set(
                "authentication_email_code", 
                user.Id.ToString(), 
                authenticationCode, 
                TimeSpan.FromMinutes(ttl));
            if (!saveStatus) return false;

            // send mail
            return await mailService.SendAuthenticationCodeViaEmail(user.Email, authenticationCode, ttl);
        }
    }
}
