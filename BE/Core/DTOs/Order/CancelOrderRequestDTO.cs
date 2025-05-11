using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Order
{
    public class CancelOrderRequestDTO
    {
        [Required(ErrorMessage = "Lý do không thể bỏ trống")]
        public string Reason { get; set; }
    }
}
