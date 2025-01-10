using Data;
using Data.Entities.System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Repositories.Impl
{
    public class GenderRepository : BaseRepository<Gender, int>, IGenderRepository
    {
        public GenderRepository(AppDbContext context) : base(context)
        {
        }
    }
}
