using Core.Repositories;
using Data.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Utilities
{
    public class SeedData
    {
        public static async Task Init(IRoleRepository roleRepository, IGenderRepository genderRepository, IUserRepository userRepository)
        {
            // Init default roles
            string[] roles = new[] { "Admin", "User", "Seller" };
            foreach (string role in roles)
            {
                if (!await roleRepository.IsExists(e => e.Name.ToLower() == role.ToLower()))
                    await roleRepository.Add(new Role { Name = role });
            }
            await roleRepository.Save();

            // Init default genders
            string[] genders = new[] { "UnSet", "Male", "Female" };
            foreach (string gender in genders)
            {
                if (!await genderRepository.IsExists(e => e.Value.ToLower() == gender.ToLower()))
                    await genderRepository.Add(new Gender { Value = gender });
            }
            await genderRepository.Save();

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
                    GenderId = (await genderRepository.Get(e => e.Value.ToLower() == "unset"))!.Id,
                    Password = Helper.HashPassword(EnvHelper.GetAdminPassword()),
                    PhoneNumber = "0000000000",
                    IsEmailComfirmed = true,
                    IsActivated = true,
                    AccessFailedCount = 0,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                };
                await userRepository.AddUserRoles(admin, "Admin");
                await userRepository.Add(admin);
                await userRepository.Save();
            }
        }
    }
}
