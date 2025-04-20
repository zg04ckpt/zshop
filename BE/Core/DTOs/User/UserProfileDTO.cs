using Core.Entities.System;
using Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Core.DTOs.User
{
    public class UserProfileDTO
    {
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Gender Gender { get; set; }

        public DateTime? DateOfBirth { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
