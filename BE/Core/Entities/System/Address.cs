using Core.Entities.PaymentFeature;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.System
{
    public class Address
    {
        public Guid Id { get; set; }
        public string District { get; set; }
        public string City { get; set; }
        public string Ward { get; set; }
        public string Detail { get; set; }
        public string PhoneNumber { get; set; }
        public string ReceiverName { get; set; }
        public Guid UserId { get; set; }

        // rela
        public User User { get; set; }
        public List<Order> Orders { get; set; }
    }
}
