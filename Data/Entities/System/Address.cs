using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities.System
{
    public class Address // Deatail - District - Province
    {
        public Guid Id { get; set; }
        public string Province { get; set; }
        public string District { get; set; }
        public string Detail { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
    }
}
