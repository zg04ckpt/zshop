using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.User
{
    public class AddressItemDTO
    {
        public string Id { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string Ward { get; set; }
        public string Detail { get; set; }
        public string PhoneNumber { get; set; }
        public string ReceiverName { get; set; }
        public bool IsDefault { get; set; }  
    }
}
