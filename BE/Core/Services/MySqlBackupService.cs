using Core.Configurations;
using Core.DTOs.Backup;
using Core.DTOs.Common;
using Core.Exceptions;
using Core.Interfaces.Services;
using Core.Providers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Diagnostics;

namespace Core.Services
{
    public class MySqlBackupService : IBackupService
    {
        private readonly IDbConnectionInfoProvider _info;
        private readonly BackupConfig _config;
        private readonly ILogger<MySqlBackupService> _logger;

        public MySqlBackupService(
            IOptions<BackupConfig> config,
            IDbConnectionInfoProvider info,
            ILogger<MySqlBackupService> logger)
        {
            _info = info;
            _config = config.Value;

            Directory.CreateDirectory(Path.Combine(AppContext.BaseDirectory, _config.BackupPath));
            _logger = logger;
        }

        public async Task<ApiResult<string>> ApplySnapshot(string snapshotName)
        {
            var snapshotPath = Path.Combine(AppContext.BaseDirectory, _config.BackupPath, snapshotName);
            if (!File.Exists(snapshotPath))
            {
                throw new BadRequestException("Snapshot không tồn tại");
            }
            var args = $"-h {_info.GetHost()} -P {_info.GetPort()} -u {_info.GetUserName()} --password={_info.GetPassword()} {_info.GetDatabaseName()}";

            var psi = new ProcessStartInfo
            {
                FileName = "mysql",
                Arguments = args,
                RedirectStandardInput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(psi);
            if (process == null)
            {
                _logger.LogError("Khởi tạo tiến trình mysql thất bại");
                throw new InternalServerErrorException("Không thể khởi tạo tiến trình apply backup");
            }

            var backupContent = await File.ReadAllTextAsync(snapshotPath);
            backupContent = System.Text.RegularExpressions.Regex.Replace(
                backupContent,
                @"SET @@(GLOBAL\.|SESSION\.)?GTID_PURGED.*?;\s*",
                "",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Singleline
            );
            await process.StandardInput.WriteAsync(backupContent);
            process.StandardInput.Close();

            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                _logger.LogError($"Lỗi chạy tiến trình mysql: " + error);
                throw new InternalServerErrorException("Chạy tiến trình apply backup thất bại");
            }

            return new ApiSuccessResult<string>(snapshotName);
        }

        public async Task<ApiResult<string>> CreateSnapshot(RequestCreateSnapshotDTO request)
        {
            var snapshotName = $"{(string.IsNullOrEmpty(request.Name)? "backups" : request.Name)}_{DateTime.Now:HH-mm-ss_dd-MM-yyyy}";
            var snapshotPath = Path.Combine(AppContext.BaseDirectory, _config.BackupPath, snapshotName);
            var args =
               $"--single-transaction --quick --skip-lock-tables --set-gtid-purged=OFF " +
               $"-h {_info.GetHost()} -P {_info.GetPort()} -u {_info.GetUserName()} --password={_info.GetPassword()} {_info.GetDatabaseName()}";
            
            var psi = new ProcessStartInfo
            {
                FileName = "mysqldump",
                Arguments = args,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(psi);
            if (process == null)
            {
                _logger.LogError("Khởi tạo tiến trình mysqldump thất bại");
                throw new InternalServerErrorException("Không thể khởi tạo tiến trình backup");
            }

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                _logger.LogError($"Lỗi chạy tiến trình: " + error);
                throw new InternalServerErrorException("Chạy tiến trình backup thất bại");
            }

            await File.WriteAllTextAsync(snapshotPath, output);
            return new ApiSuccessResult<string>(snapshotName);
        }

        public async Task<ApiResult<string>> DeleteSnapshot(string snapshotName)
        {
            var snapshotPath = Path.Combine(AppContext.BaseDirectory, _config.BackupPath, snapshotName);

            if (File.Exists(snapshotPath))
                File.Delete(snapshotPath);

            return await Task.FromResult(new ApiSuccessResult<string>(snapshotName));
        }

        public async Task<ApiResult<BackupInfoDTO[]>> GetAllSnapshots()
        {
            var fileNames = Directory.GetFiles(Path.Combine(AppContext.BaseDirectory, _config.BackupPath))
                .OrderByDescending(f => File.GetCreationTime(f))
                .Select(f =>
                {
                    var fileInfo = new FileInfo(f);
                    return new BackupInfoDTO
                    {
                        Name = Path.GetFileNameWithoutExtension(f),
                        CreatedAt = fileInfo.LastWriteTime,
                        Size = fileInfo.Length
                    };
                })
                .ToArray();
            return await Task.FromResult(new ApiSuccessResult<BackupInfoDTO[]>(fileNames));
        }
    }
}
