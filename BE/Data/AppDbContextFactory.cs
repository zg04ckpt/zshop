using Core.Utilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionBuilder.UseMySql(
                EnvHelper.GetMySQLConnectionString(),
                new MySqlServerVersion(new Version(8, 0, 37)));

            return new AppDbContext(optionBuilder.Options);
        }
    }
}
