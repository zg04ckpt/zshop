using Core.Entities.System;
using Core.Exceptions;
using Core.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public async Task AddUserRoles(User user, string roleName)
        {
            Role role = await _context.Set<Role>().AsNoTracking()
                .FirstOrDefaultAsync(e => e.Name.ToLower() == roleName.ToLower())
                ?? throw new BadRequestException($"Vai trò {roleName} không tồn tại");

            _context.Set<UserRole>().Add(new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            });
        }

        public async Task<bool> AnyInRole(string roleName)
        {
            var role = await _context.Set<Role>().FirstOrDefaultAsync(e => e.Name.ToLower() == roleName.ToLower());
            if(role is null)  return false;
            return await _context.Set<UserRole>().AnyAsync(e => e.RoleId == role.Id);
        }

        public async Task<Guid?> GetDefaultAddress(Guid userId)
        {
            return await _context.Set<User>().Where(e => e.Id == userId).Select(e => e.DefaultAddressId).FirstAsync();
        }

        public async Task<List<Role>> GetRolesOfUser(Guid userId)
        {
            return await (from role in _context.Set<Role>()
                          join ur in _context.Set<UserRole>() on role.Id equals ur.RoleId
                          where ur.UserId == userId
                          select role).ToListAsync();
        }
    }
}
