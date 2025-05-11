
using Core.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.User
{
    public class SearchUserDTO : BasePaging
    {
        public string? Name { get; set; } 
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public int RoleId { get; set; }
        public bool IsActivated { get; set; } = true;
    }
}
