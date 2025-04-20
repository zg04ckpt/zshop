using Data;
using Core.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Interfaces.Repositories;

namespace Core.Repositories.Impl
{
    public class RoleRepository : BaseRepository<Role, int>, IRoleRepository
    {
        public RoleRepository(AppDbContext context) : base(context)
        {
        }
    }
}
