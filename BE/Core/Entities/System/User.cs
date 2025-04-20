using Core.Entities.BookFeature;
using Core.Entities.PaymentFeature;
using Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.System
{
    public class User
    {
        public Guid Id { get; set; }
        public string? AvatarUrl { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public Gender Gender { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; } // Hashed
        public bool IsEmailComfirmed { get; set; }
        public bool IsActivated { get; set; }
        public int AccessFailedCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastLogin { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid? DefaultAddressId { get; set; }    
        
        //Rela
        public List<Address> Addresses { get; set; }
        public List<UserRole> UserRoles { get; set; }
        public List<Review> Reviews { get; set; }
        public List<Order> Orders { get; set; }
        public Cart? Cart { get; set; }
    }
}

