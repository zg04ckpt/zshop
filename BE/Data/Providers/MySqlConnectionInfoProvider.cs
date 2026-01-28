using Core.Providers;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace Data.Providers
{
    public class MySqlConnectionInfoProvider : IDbConnectionInfoProvider
    {
        private readonly MySqlConnectionStringBuilder _builder;

        public MySqlConnectionInfoProvider(AppDbContext context)
        {
            _builder = new MySqlConnectionStringBuilder(context.Database.GetConnectionString()!);
        }

        public string GetConnectionString()
        {
            return _builder.ConnectionString;
        }

        public string GetDatabaseName()
        {
            return _builder.Database;
        }

        public string GetHost()
        {
            return _builder.Server;
        }

        public string GetPassword()
        {
            return _builder.Password;
        }

        public int GetPort()
        {
            return (int)_builder.Port;
        }

        public string GetUserName()
        {
            return _builder.UserID;
        }
    }
}
