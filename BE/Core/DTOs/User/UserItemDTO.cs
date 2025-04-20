using Core.Entities.BookFeature;
using Core.Entities.System;
using Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.User
{
    public class UserItemDTO
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string UserName { get; set; }
        public Gender Gender { get; set; }
        public bool IsActivated { get; set; }
        public DateTime LastLogin { get; set; }
        public string[] Roles { get; set; }
    }
}
