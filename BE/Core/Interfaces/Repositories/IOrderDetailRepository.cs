using Core.Entities.PaymentFeature;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositories
{
    public interface IOrderDetailRepository : IBaseRepository<OrderDetail, int>
    {
    }
}
