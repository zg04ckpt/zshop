using Core.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Order
{
    public class SystemOrdersDTO : Paginated<OrderHistoryListItemDTO>
    {
        public decimal TotalOrderAmount { get; set; }
        public decimal TotalPaidAmount { get; set; }
    }
}
