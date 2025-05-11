using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Book
{
    public class BoughtBookListItemDTO : BookListItemDTO
    {
        public DateTime LastPurchasedAt { get; set; }
        public int PurchaseCount { get; set; }
    }
}
