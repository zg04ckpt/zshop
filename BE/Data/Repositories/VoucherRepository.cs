using Core.Entities.VoucherFeature;
using Core.Interfaces.Repositories;
using Core.Repositories.Impl;

namespace Data.Repositories
{
    public class VoucherRepository : BaseRepository<Voucher, string>, IVoucherRepository
    {
        public VoucherRepository(AppDbContext context) : base(context)
        {
        }
    }
}
