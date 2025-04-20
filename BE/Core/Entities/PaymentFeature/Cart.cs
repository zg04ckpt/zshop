using Core.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities.PaymentFeature
{
    public class Cart
    {
        public string Id { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Rela
        public User User { get; set; }
        public List<CartItem> Items { get; set; }
    }
}
