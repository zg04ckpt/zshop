using Core.DTOs.Common;
using Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Order
{
    public class SystemOrderSearchDTO : BasePaging
    {
        public OrderStatus? Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
