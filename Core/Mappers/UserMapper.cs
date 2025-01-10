using Core.DTOs.Auth;
using Core.Utilities;
using Data.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Mappers
{
    public class UserMapper
    {
        public User MapFrom(RegisterDTO data)
        {
            return new User
            {
                Id = Guid.NewGuid(),
                FirstName = data.FirstName,
                LastName = data.LastName,
                Email = data.Email,
                PhoneNumber = data.PhoneNumber,
                UserName = data.UserName,
                Password = Hasher.HashPassword(data.Password),
                IsEmailComfirmed = false,
                IsActivated = true,
                AccessFailedCount = 0,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
        }
    }
}
