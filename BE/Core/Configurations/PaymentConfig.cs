using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Configurations
{
    public class PaymentConfig
    {
        public int ExpireInMinutes { get; set; }
        public string ClientHomeUrl { get; set; }
    }
}
