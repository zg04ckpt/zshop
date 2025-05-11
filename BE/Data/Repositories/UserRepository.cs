using Core.Exceptions;
using Data;
using Core.Entities.System;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Interfaces.Repositories;

namespace Core.Repositories.Impl
{
    public class UserRepository : BaseRepository<User, Guid>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public async Task AddUserRoles(User user, string roleName)
        {
            Role role = await context.Roles.AsNoTracking()
                .FirstOrDefaultAsync(e => e.Name.ToLower() == roleName.ToLower())
                ?? throw new BadRequestException($"Vai trò {roleName} không tồn tại");

            context.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            });
        }

        public async Task<bool> AnyInRole(string roleName)
        {
            var role = await context.Roles.FirstOrDefaultAsync(e => e.Name.ToLower() == roleName.ToLower());
            if(role is null)  return false;
            return await context.UserRoles.AnyAsync(e => e.RoleId == role.Id);
        }

        public async Task<Guid?> GetDefaultAddress(Guid userId)
        {
            return await context.Users.Where(e => e.Id == userId).Select(e => e.DefaultAddressId).FirstAsync();
        }

        public async Task<List<Role>> GetRolesOfUser(Guid userId)
        {
            return await (from role in context.Roles
                          join ur in context.UserRoles on role.Id equals ur.RoleId
                          where ur.UserId == userId
                          select role).ToListAsync();
        }
    }
}
