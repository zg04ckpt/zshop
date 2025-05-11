using Core.Entities.PaymentFeature;
using Core.Interfaces.Repositories;
using Core.Repositories.Impl;

namespace Data.Repositories
{
    public class CartRepository : BaseRepository<Cart, string>, ICartRepository
    {
        public CartRepository(AppDbContext context) : base(context)
        {
        }
    }
}
