using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Enums
{
    public enum OrderStatus
    {
        Created,      // Order has been initiated by the customer but not yet finalized
        Placed,       // Order has been submitted by the customer
        Accepted,     // Seller has confirmed the order (e.g., payment and stock verified)
        InProgress,   // Order is being prepared (e.g., packed or awaiting shipment)
        Shipping,      // Order has been handed over to the carrier
        Delivered,    // Order has been received by the customer
        Cancelled     // Order was canceled by the customer or seller (before shipping)
    }
}


