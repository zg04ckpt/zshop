using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Cart
{
    public class PayCartDTO
    {
        public List<PayCartItemDTO> Items { get; set; }
    }

    public class PayCartItemDTO
    {
        public Guid BookId { get; set; }
        public int Quantity { get; set; }
    }
}
