using Core.Entities.PaymentFeature;
using Core.Interfaces.Repositories;
using Core.Repositories.Impl;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Repositories
{
    public class CancelOrderRequestRepository : BaseRepository<CancelOrderRequest, int>, ICancelOrderRequestRespository
    {
        public CancelOrderRequestRepository(AppDbContext context) : base(context)
        {
        }
    }
}
