using Data.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Repositories
{
    public interface IUserRepository : IBaseRepository<User, Guid>
    {
        Task AddUserRoles(User user, string roleName);
        Task<bool> AnyInRole(string roleName);
        Task<List<Role>> GetRolesOfUser(Guid userId);
    }
}
