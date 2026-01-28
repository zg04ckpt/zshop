using Microsoft.EntityFrameworkCore;

namespace Data
{
    public class SystemDbContext : DbContext
    {
        public SystemDbContext(DbContextOptions<SystemDbContext> options)
        : base(options)
        {
        }
    }
}
