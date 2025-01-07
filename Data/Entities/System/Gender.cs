using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Entities.System
{
    public class Gender
    {
        public int Id { get; set; }
        public string Value { get; set; }
        public List<User> Users { get; set; }
    }
}
