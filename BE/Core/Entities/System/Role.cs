using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.System
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public List<UserRole> UserRoles { get; set; }
    }

    public class RoleNames
    {
        public const string Admin = nameof(Admin);
        public const string User = nameof(User);
        public const string Seller = nameof(Seller);
        public const string Tester = nameof(Tester);
    }
}
