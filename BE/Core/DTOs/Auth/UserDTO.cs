using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Auth
{
    public class UserDTO
    {
        public string UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public List<string> Roles { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
