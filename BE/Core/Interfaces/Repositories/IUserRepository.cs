using Core.Entities.System;

namespace Core.Interfaces.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task AddUserRoles(User user, string roleName);
        Task<bool> AnyInRole(string roleName);
        Task<List<Role>> GetRolesOfUser(Guid userId);
        Task<Guid?> GetDefaultAddress(Guid userId);
    }
}
