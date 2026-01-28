using Core.Configurations;
using Core.DTOs.Auth;
using Core.DTOs.Common;
using Core.Entities.System;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Utilities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace Core.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtService _jwtService;
        private readonly IRedisService _redisService;
        private readonly IMailService _mailService;
        private readonly AuthConfig _authConfig;

        public AuthService(
            IUnitOfWork unitOfWork,
            IJwtService jwtService, 
            IOptions<AuthConfig> config, 
            IRedisService redisService, 
            IMailService mailService)
        {
            _unitOfWork = unitOfWork;
            _jwtService = jwtService;
            _redisService = redisService;
            _mailService = mailService;
            _authConfig = config.Value;
        }

        public async Task<LoginResponseDTO> LogIn(LoginDTO data)
        {
            var userRepo = _unitOfWork.Users;

            // Check valid
            var user = await userRepo.GetFirstAsync(e => e.Email == data.Email)
                ?? throw new BadRequestException("Email không tồn tại");

            // Check email confirm
            if (!user.IsEmailComfirmed)
            {
                throw new BadRequestException("Vui lòng xác thực email trước khi đăng nhập");
            }

            // Check if this user is locked from logging in (_redis) 
            var remainingLockTime = await _redisService.GetTTL(type: KeySet.RedisType.LOGIN_LOCKED, key: user.Id.ToString());
            if (remainingLockTime > 0)
            {
                throw new LockedException($"Chức năng đăng nhập của bạn đang bị khóa, đăng nhập lại sau {remainingLockTime} giây nữa.");
            }

            // Limit incorrect password times
            // 16d2581c155ca7741af54d3f48bebc0d0ef79d895354c254c40ee649657c19e3
            var maxFailCount = _authConfig.MaxFailedAttempts;
            if (Helper.HashPassword(data.Password) != user.Password)
            {
                user.AccessFailedCount++;
                if (user.AccessFailedCount > maxFailCount)
                {
                    // reset AccessFailedCount
                    user.AccessFailedCount = 0;
                    await userRepo.UpdateAsync(user);
                    await _unitOfWork.SaveChangesAsync();

                    // lock login feature(by _redis)
                    int ttl = _authConfig.LoginLockFlagTTL;
                    await _redisService.Set(
                        type: KeySet.RedisType.LOGIN_LOCKED,
                        key: user.Id.ToString(),
                        value: "true",
                        ttl: TimeSpan.FromMinutes(ttl));

                    throw new LockedException($"Sai mật khẩu quá {maxFailCount} lần liên tiếp, khóa đăng nhập trong vòng {ttl} phút!");
                }
                await userRepo.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
                throw new BadRequestException($"Mật khẩu không chính xác, còn {maxFailCount - user.AccessFailedCount} lần thử!");
            }

            // Reset incorrect password times if login success
            user.AccessFailedCount = 0;
            user.LastLogin = DateTime.UtcNow;
            await userRepo.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // Create JWT token
            List<string> roles = (await userRepo.GetRolesOfUser(user.Id)).Select(e => e.Name).ToList();
            JwtTokenDTO token = _jwtService.IssueToken(user, roles, isLogin: true);

            return new LoginResponseDTO
            {

                User = new UserDTO
                {
                    UserId = user.Id.ToString(),
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    AvatarUrl = user.AvatarUrl,
                    Roles = roles
                },
                Token = token,
            };
        }

        public async Task<ApiResult> LogOut(string? accessToken)
        {
            if (accessToken != null)
            {
                await _jwtService.RevokeToken(accessToken);
                return new ApiSuccessResult("Đăng xuất thành công");
            }
            else
            {
                return new ApiErrorResult("Bạn chưa đăng nhập");
            }
        }

        public async Task<ApiResult> RefreshPassword(ResetPasswordDTO data)
        {
            var userRepo = _unitOfWork.Users;
            var user = await userRepo.GetFirstAsync(e => e.Email == data.Email)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            // Get code in _redis to check valid
            string? code = await _redisService.Get(type: KeySet.RedisType.RESET_PASS, key: user.Id.ToString());
            if (string.IsNullOrEmpty(code) || code != data.Code)
                throw new BadRequestException("Mã xác thực không hợp lệ.");

            // reset pass
            user.Password = Helper.HashPassword(data.Password);
            await userRepo.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // free up _redis memory space
            await _redisService.Delete(type: KeySet.RedisType.RESET_PASS, key: user.Id.ToString());

            return new ApiSuccessResult("Thay đổi mật khẩu thành công");
        }

        public async Task<JwtTokenDTO> RefreshToken(string accessToken, string refreshToken)
        {
            var userRepo = _unitOfWork.Users;

            var claim = _jwtService.ValidateAccessToken(accessToken)
                ?? throw new UnauthorizedException("Access token không hợp lệ");

            // Get user data to issue new token set
            string userId = claim.FindFirstValue(ClaimTypes.NameIdentifier);
            User user = await userRepo.GetFirstAsync(u => u.Id.ToString() == userId)
                ?? throw new UnauthorizedException("Access token không hợp lệ");
            List<string> roles = (await userRepo.GetRolesOfUser(user.Id)).Select(e => e.Name).ToList();

            // Check refesh token valid
            if (!await _jwtService.ValidateRefreshToken(userId, refreshToken))
                throw new UnauthorizedException("Refresh token không hợp lệ");

            JwtTokenDTO token = _jwtService.IssueToken(user, roles, isLogin: false);

            return token;
        }

        public async Task<ApiResult> Register(RegisterDTO data)
        {
            var userRepo = _unitOfWork.Users;

            // check duplication 
            if (await userRepo.ExistsAsync(e => e.UserName.ToLower() == data.UserName.ToLower()))
                throw new BadRequestException("Tên người dùng đã tồn tại");
            if (await userRepo.ExistsAsync(e => e.Email.ToLower() == data.Email.ToLower()))
                throw new BadRequestException("Email đã được sử dụng");
            if (await userRepo.ExistsAsync(e => e.PhoneNumber == data.PhoneNumber))
                throw new BadRequestException("Số điện thoại đã được sử dụng");

            // create new user with role user
            var user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = data.FirstName.Trim(),
                LastName = data.LastName.Trim(),
                Email = data.Email,
                PhoneNumber = data.PhoneNumber,
                UserName = data.UserName,
                Password = Helper.HashPassword(data.Password),
                Gender = Enums.Gender.Male,
                DateOfBirth = null,
                IsEmailComfirmed = false,
                IsActivated = true,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await userRepo.AddAsync(user);
            await userRepo.AddUserRoles(user, "User");

            // use 6 digits code to authenticate email
            if (!await AuthenticateUserEmail(user))
                throw new InternalServerErrorException("Đăng kí tài khoản thất bại, vui lòng thử lại.");

            // save when success all and response with created user id
            await _unitOfWork.SaveChangesAsync();
            return new ApiSuccessResult("Đăng kí tài khoản thành công, vui lòng kiểm tra email đăng kí để lấy mã xác thực tài khoản.");
        }

        public async Task<ApiResult> ResendConfirmEmailCode(string email)
        {
            var userRepo = _unitOfWork.Users;

            User user = await userRepo.GetFirstAsync(e => e.Email == email)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            // Need to check if user email is confirmed
            if (user.IsEmailComfirmed)
                throw new BadRequestException("Email đã được xác thực.");

            if (await _redisService.ExistsAsync(KeySet.RedisType.CONFIRM_EMAIL, user.Email))

                if (!await AuthenticateUserEmail(user))
                    throw new InternalServerErrorException("Gửi thất bại, vui lòng thử lại.");

            return new ApiSuccessResult("Gửi thành công");
        }

        public async Task<ApiResult> RequestSendResetPassAuthCode(string email)
        {
            var userRepo = _unitOfWork.Users;

            User user = await userRepo.GetFirstAsync(e => e.Email == email)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            // Generate 6 digit chars, save to _redis and send to user email
            string code = Helper.GenerateRandomToken("0123456789", 6);
            int ttl = _authConfig.ResetPassAuthCodeTTL;
            if (!await _redisService.Set(KeySet.RedisType.RESET_PASS, user.Id.ToString(), code, TimeSpan.FromMinutes(ttl)))
                throw new InternalServerErrorException("Đã có lỗi xảy ra, vui lòng thử lại.");
            if (!await _mailService.SendAuthenticationCodeViaEmail(email, code, ttl, "refresh_password.html"))
                throw new InternalServerErrorException("Gửi mã thất bại, vui lòng thử lại.");

            return new ApiSuccessResult("Đã gửi mã xác thực.");
        }

        public async Task<ApiResult> ConfirmEmailByCode(ConfirmEmailDTO data)
        {
            var userRepo = _unitOfWork.Users;

            User user = await userRepo.GetFirstAsync(e => e.Email == data.Email)
                ?? throw new BadRequestException("Người dùng không tồn tại");

            // validate code from _redis
            string? validCode = await _redisService.Get(KeySet.RedisType.CONFIRM_EMAIL, user.Email);
            if (validCode is null || validCode != data.Code)
                throw new BadRequestException("Mã xác thực không chính xác hoặc hết hạn, vui lòng thử lại!");

            // update confirm email status
            user.IsEmailComfirmed = true;
            await userRepo.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // remove code in _redis
            await _redisService.Delete(KeySet.RedisType.CONFIRM_EMAIL, user.Email);

            return new ApiSuccessResult("Xác thực email người dùng thành công.");
        }

        private async Task<bool> AuthenticateUserEmail(User user)
        {
            string authenticationCode = Helper.GenerateRandomToken(src: "0123456789", len: 6);
            int ttl = _authConfig.ConfirmEmailAuthCodeTTL;
            // Use _redis to save authentication code
            bool saveStatus = await _redisService.Set(
                KeySet.RedisType.CONFIRM_EMAIL,
                user.Email,
                authenticationCode,
                TimeSpan.FromMinutes(ttl));
            if (!saveStatus) return false;

            // send mail
            return await _mailService.SendAuthenticationCodeViaEmail(user.Email, authenticationCode, ttl, "confirm_email.html");
        }
        
        public async Task<JwtTokenDTO> GoogleLogIn(AuthenticateResult? data)
        {
            var userRepo = _unitOfWork.Users;

            if (data is null || !data.Succeeded)
            {
                throw new BadRequestException("Xác thực thất bại");
            }

            // Get email and check if there is already an user with this email
            // If no exist => create new user, else => update lastLogin
            var claims = data.Principal.Claims;
            var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
                ?? throw new BadRequestException("Thông tin xác thực không hợp lệ.");
            var user = await userRepo.GetFirstAsync(e => e.Email == email);
            if (user is null)
            {
                user = new User
                {
                    AvatarUrl = claims.FirstOrDefault(e => e.Type == "image")?.Value,
                    Id = Guid.NewGuid(),
                    UserName = "user" + (claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value
                        ?? DateTime.UtcNow.ToString("ddMMyyyyHHmmss")),
                    FirstName = claims.FirstOrDefault(c => c.Type == ClaimTypes.Surname)?.Value ?? "Ẩn danh",
                    LastName = claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value ?? "",
                    Email = email,
                    Password = Helper.HashPassword(Guid.NewGuid().ToString()),
                    PhoneNumber = "",
                    Gender = Enums.Gender.Male,
                    IsEmailComfirmed = true,
                    IsActivated = true,
                    AccessFailedCount = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }; 
                await userRepo.AddAsync(user);
                await userRepo.AddUserRoles(user, "User");
            } 
            else
            {
                user.LastLogin = DateTime.UtcNow;
                await userRepo.UpdateAsync(user);
            }
            await _unitOfWork.SaveChangesAsync();

            // Create JWT token
            List<string> roles = (await userRepo.GetRolesOfUser(user.Id)).Select(e => e.Name).ToList();
            JwtTokenDTO token = _jwtService.IssueToken(user, roles, isLogin: true);

            return token;
        }

        public async Task<ApiResult<UserDTO>> GetLoginInfo(ClaimsPrincipal claims)
        {
            var userRepo = _unitOfWork.Users;

            var userId = Helper.GetUserIdFromClaims(claims)
                ?? throw new UnauthorizedException("Phiên hết hạn hoặc token không hợp lệ.");
            var user = await userRepo.GetFirstAsync(u => u.Id.ToString() == userId)
                ?? throw new UnauthorizedException("Người dùng không tồn tại.");

            return new ApiSuccessResult<UserDTO>(new UserDTO
            {
                UserId = user.Id.ToString(),
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                Roles = (await userRepo.GetRolesOfUser(Guid.Parse(userId)))
                    .Select(e => e.Name).ToList()
            });
        }
    }
}
