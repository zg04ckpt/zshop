using Core.Entities.BookFeature;
using Core.Entities.System;
using Core.Enums;
using Core.Interfaces.Repositories;
using Core.Utilities;
using Microsoft.EntityFrameworkCore;
using System;

namespace Data
{
    public class SeedData
    {
        public static async Task Init(
            AppDbContext _context,
            IRoleRepository roleRepository, 
            IUserRepository userRepository, 
            ICategoryRepository categoryRepository)
        {
            await _context.Database.MigrateAsync();

            // Init default roles
            string[] roles = new[] { "Admin", "User", "Seller" };
            foreach (string role in roles)
            {
                if (!await roleRepository.IsExists(e => e.Name.ToLower() == role.ToLower()))
                    await roleRepository.Add(new Role { Name = role });
            }
            await roleRepository.Save();

            // Init admin 
            if(!await userRepository.AnyInRole("Admin"))
            {
                User admin = new()
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Nguyên",
                    LastName = "Hoàng",
                    Email = EnvHelper.GetAdminEmail(),
                    UserName = EnvHelper.GetAdminUserName(),
                    Gender = Gender.Male,
                    Password = Helper.HashPassword(EnvHelper.GetAdminPassword()),
                    PhoneNumber = "0000000000",
                    IsEmailComfirmed = true,
                    IsActivated = true,
                    AccessFailedCount = 0,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };

                User testAdmin = new()
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Nguyễn",
                    LastName = "Hoàng",
                    Email = "admin@zshop.com",
                    UserName = "testadmin",
                    Gender = Gender.Male,
                    Password = Helper.HashPassword("admin.zshop@312"),
                    PhoneNumber = "0000000000",
                    IsEmailComfirmed = true,
                    IsActivated = true,
                    AccessFailedCount = 0,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };

                await userRepository.AddUserRoles(admin, "Admin");
                await userRepository.AddUserRoles(testAdmin, "Admin");
                await userRepository.Add(admin);
                await userRepository.Add(testAdmin);
                await userRepository.Save();
            }
        }
    }
}
