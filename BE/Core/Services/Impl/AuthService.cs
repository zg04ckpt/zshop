using Core.Configurations;
using Core.DTOs.Auth;
using Core.DTOs.Common;
using Core.Exceptions;
using Core.Mappers;
using Core.Repositories;
using Core.Utilities;
using Data.Entities.System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
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
        private readonly IRedisService redisService;
        private readonly IMailService mailService;
        private readonly UserMapper userMapper;
        private readonly AuthConfig authConfig;

        public AuthService(IUserRepository userRepository, IGenderRepository genderRepository, 
            IJwtService jwtService, IOptions<AuthConfig> config, IStorageService storageService, IRedisService redisService, IMailService mailService)
        {
            this.userRepository = userRepository;
            this.userMapper = new UserMapper();
            this.genderRepository = genderRepository;
            this.jwtService = jwtService;
            this.storageService = storageService;
            this.redisService = redisService;
            this.mailService = mailService;
            this.authConfig = config.Value;
        }

        public async Task<ApiResult<LoginResponseDTO>> LogIn(LoginDTO data)
        {
            // Check valid
            User user = await userRepository.Get(e => e.Email.Equals(data.Email))
                ?? throw new BadRequestException("Email không tồn tại");

            // Check email confirm
            if(!user.IsEmailComfirmed) throw new BadRequestException("Vui lòng xác thực email trước khi đăng nhập");

            // Check if this user is locked from logging in (redis) 
            var remainingLockTime = await redisService.GetTTL(type: KeySet.RedisType.LOGIN_LOCKED, key: user.Id.ToString());
            if(remainingLockTime > 0)
            {
                throw new LockedException($"Chức năng đăng nhập của bạn đang bị khóa, đăng nhập lại sau {remainingLockTime} giây nữa.");
            }

            // Limit incorrect password times
            // 16d2581c155ca7741af54d3f48bebc0d0ef79d895354c254c40ee649657c19e3
            var maxFailCount = authConfig.MaxFailedAttempts;
            if (Helper.HashPassword(data.Password) != user.Password)
            {
                user.AccessFailedCount++;
                if (user.AccessFailedCount > maxFailCount)
                {
                    // reset AccessFailedCount
                    user.AccessFailedCount = 0;
                    userRepository.Update(user);
                    await userRepository.Save();

                    // lock login feature(by redis)
                    int ttl = authConfig.LoginLockFlagTTL;
                    await redisService.Set(
                        type: KeySet.RedisType.LOGIN_LOCKED,
                        key: user.Id.ToString(),
                        value: "true",
                        ttl: TimeSpan.FromMinutes(ttl));

                    throw new LockedException($"Sai mật khẩu quá {maxFailCount} lần liên tiếp, khóa đăng nhập trong vòng {ttl} phút!");
                }
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

        public async Task<ApiResult> RefreshPassword(ResetPasswordDTO data)
        {
            User user = await userRepository.Get(e => e.Email == data.Email)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            // Get code in redis to check valid
            string? code = await redisService.Get(type: KeySet.RedisType.RESET_PASS, key: user.Id.ToString());
            if (string.IsNullOrEmpty(code) || code != data.Code) 
                throw new BadRequestException("Mã xác thực không hợp lệ.");

            // reset pass
            user.Password = Helper.HashPassword(data.Password);
            userRepository.Update(user);
            await userRepository.Save();

            // free up redis memory space
            await redisService.Delete(type: KeySet.RedisType.RESET_PASS, key: user.Id.ToString());

            return new ApiSuccessResult("Thay đổi mật khẩu thành công");
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

        public async Task<ApiResult<string>> Register(RegisterDTO data)
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
            return new ApiSuccessResult<string>(
                "Đăng kí tài khoản thành công, vui lòng kiểm tra email đăng kí để lấy mã xác thực tài khoản.",
                user.Id.ToString());
        }

        public async Task<ApiResult> ResendConfirmEmailCode(string userId)
        {
            User user = await userRepository.Get(Guid.Parse(userId))
                ?? throw new BadRequestException("Người dùng không tồn tại");

            // Need to check if user email is confirmed
            if(user.IsEmailComfirmed)
                throw new BadRequestException("Email đã được xác thực.");

            if (!await AuthenticateUserEmail(user))
                throw new InternalServerErrorException("Gửi thất bại, vui lòng thử lại.");

            return new ApiSuccessResult("Gửi thành công");
        }

        public async Task<ApiResult> SendResetPassAuthCode(string email)
        {
            User user = await userRepository.Get(e => e.Email == email)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            // Generate 6 digit chars, save to redis and send to user email
            string code = Helper.GenerateRandomToken("0123456789", 6);
            int ttl = authConfig.ResetPassAuthCodeTTL;
            if (!await redisService.Set(KeySet.RedisType.RESET_PASS, user.Id.ToString(), code, TimeSpan.FromMinutes(ttl)))
                throw new InternalServerErrorException("Đã có lỗi xảy ra, vui lòng thử lại.");
            if (!await mailService.SendAuthenticationCodeViaEmail(email, code, ttl, "refresh_password.html"))
                throw new InternalServerErrorException("Gửi mã thất bại, vui lòng thử lại.");

            return new ApiSuccessResult("Đã gửi mã xác thực.");
        }

        public async Task<ApiResult> ValidateEmailByCode(ConfirmEmailDTO data)
        {
            // validate code from redis
            string? validCode = await redisService.Get(KeySet.RedisType.CONFIRM_EMAIL, data.UserId);
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
            string authenticationCode = Helper.GenerateRandomToken(src: "0123456789", len: 6);
            int ttl = authConfig.ConfirmEmailAuthCodeTTL;
            // Use redis to save authentication code
            bool saveStatus = await redisService.Set(
                KeySet.RedisType.CONFIRM_EMAIL, 
                user.Id.ToString(), 
                authenticationCode, 
                TimeSpan.FromMinutes(ttl));
            if (!saveStatus) return false;

            // send mail
            return await mailService.SendAuthenticationCodeViaEmail(user.Email, authenticationCode, ttl, "confirm_email.html");
        }
    }
}
