using Core.Configurations;
using Core.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Data.Repositories
{
    public class SQLServerBackupRepository : IBackupRepository
    {
        private readonly SystemDbContext _masterContext;
        private readonly BackupConfig _config;
        private readonly string _backupDbName;

        public SQLServerBackupRepository(
            IOptions<BackupConfig> config,
            SystemDbContext context,
            AppDbContext appContext)
        {
            _masterContext = context;
            _config = config.Value;
            _backupDbName = appContext.Database.GetDbConnection().Database;
        }

        public async Task ApplySnapshot(string snapshotName)
        {
            var sql = $@"
                -- Ép database về single user và kill connection
                ALTER DATABASE [{_backupDbName}]
                SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

                RESTORE DATABASE [{_backupDbName}]
                FROM DATABASE_SNAPSHOT = '{snapshotName}';

                -- Mở lại multi user
                ALTER DATABASE [{_backupDbName}]
                SET MULTI_USER;
            ";

            await _masterContext.Database.ExecuteSqlRawAsync(sql);
        }

        public async Task CreateSnapshot(string snapshotName)
        {
            var filePath = Path.Combine(AppContext.BaseDirectory, _config.BackupPath, $"{snapshotName}.ss");
            var sql = $@"
                CREATE DATABASE [{snapshotName}]
                ON
                (
                    NAME = '{_backupDbName}',
                    FILENAME = '{filePath}'
                )
                AS SNAPSHOT OF [{_backupDbName}];";
            await _masterContext.Database.ExecuteSqlRawAsync(sql);
        }

        public async Task DeleteSnapshot(string snapshotName)
        {
            var sql = $@"
            IF DB_ID('{snapshotName}') IS NOT NULL
                DROP DATABASE [{snapshotName}];
            ";

            await _masterContext.Database.ExecuteSqlRawAsync(sql);
        }
    }
}
