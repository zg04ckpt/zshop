using Core.Entities.System;
using Core.Enums;
using Core.Interfaces;
using Core.Utilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;

namespace Data
{
    public class SeedData
    {
        private readonly AppDbContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<SeedData> _logger;

        public SeedData(
            AppDbContext context, 
            IUnitOfWork unitOfWork, 
            ILogger<SeedData> logger)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task InitAsync()
        {
            // Migrating
            try
            {
                await _context.Database.MigrateAsync();
                _logger.LogInformation("Checked migration");
            }
            catch (Exception ex)
            {
                _logger.LogError("Failed to migrate: " + ex.Message);
            }

            // InitAsync default data
            try
            {
                await _unitOfWork.BeginTransactionAsync();
                var roleRepo = _unitOfWork.Repository<Role>();
                var userRepo = _unitOfWork.Users;

                // InitAsync default roles
                string[] roles = new[] {
                    RoleNames.Admin,
                    RoleNames.User,
                    RoleNames.Seller,
                    RoleNames.Tester,
                };
                foreach (string role in roles)
                {
                    if (!await roleRepo.ExistsAsync(e => e.Name.ToLower() == role.ToLower()))
                    {
                        await roleRepo.AddAsync(new Role { Name = role });
                    }
                }
                await _unitOfWork.SaveChangesAsync();

                // InitAsync admin account
                if (!await userRepo.ExistsAsync(e => e.UserName == "admin"))
                {
                    var admin = new User()
                    {
                        Id = Guid.NewGuid(),
                        FirstName = "Admin",
                        LastName = "System",
                        Email = EnvHelper.GetAdminEmail(),
                        UserName = EnvHelper.GetAdminUserName(),
                        Gender = Gender.Male,
                        Password = Helper.HashPassword(EnvHelper.GetAdminPassword()),
                        PhoneNumber = "0000000000",
                        IsEmailComfirmed = true,
                        IsActivated = true,
                        AccessFailedCount = 0,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    };

                    await userRepo.AddUserRoles(admin, RoleNames.Admin);
                    await userRepo.AddAsync(admin);
                }

                if (!await userRepo.ExistsAsync(e => e.UserName == "tester"))
                {
                    var tester = new User()
                    {
                        Id = Guid.NewGuid(),
                        FirstName = "Hoàng Văn",
                        LastName = "Tester",
                        Email = "test@zshop.com",
                        UserName = "tester",
                        Gender = Gender.Male,
                        Password = Helper.HashPassword("test"),
                        PhoneNumber = "0000000000",
                        IsEmailComfirmed = true,
                        IsActivated = true,
                        AccessFailedCount = 0,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                    };

                    await userRepo.AddUserRoles(tester, RoleNames.Tester);
                    await userRepo.AddAsync(tester);
                }

                await _unitOfWork.CommitTransactionAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("Khởi tạo dữ liệu mặc định thất bại: " + ex.Message);
                await _unitOfWork.RollbackTransactionAsync();
            }

            _logger.LogInformation("Đã kiểm tra & khởi tạo dữ liệu mặc định");
        }
    }
}
