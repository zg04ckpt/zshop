using Core.Configurations;
using Core.DTOs.Backup;
using Core.DTOs.Common;
using Core.Exceptions;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Microsoft.Extensions.Options;

namespace Core.Services
{
    public class SqlServerBackupService : IBackupService
    {
        private readonly BackupConfig _config;
        private readonly IBackupRepository _backupRepository;
        private readonly string _backupPath;

        public SqlServerBackupService(
            IBackupRepository backupRepository,
            IOptions<BackupConfig> config)
        {
            _config = config.Value;
            _backupPath = Path.Combine(AppContext.BaseDirectory, _config.BackupPath);  
            if (!File.Exists(_backupPath))
            {
                File.Create(_backupPath);
            }
        }

        public async Task<ApiResult<string>> ApplySnapshot(string snapshotName)
        {
            if (!File.Exists(Path.Combine(_backupPath, snapshotName)))
            {
                throw new BadRequestException("Snapshot không tồn tại");
            }
            await _backupRepository.ApplySnapshot(snapshotName);
            return new ApiSuccessResult<string>(snapshotName);
        }

        public async Task<ApiResult<string>> CreateSnapshot(RequestCreateSnapshotDTO request)
        {
            var snapshotName = $"{(string.IsNullOrEmpty(request.Name) ? "backups" : request.Name)}_{DateTime.Now:HH-mm-ss-dd-MM-yyyy}";
            await _backupRepository.CreateSnapshot(snapshotName);
            return new ApiSuccessResult<string>(snapshotName);
        }

        public async Task<ApiResult<string>> DeleteSnapshot(string snapshotName)
        {
            if (!File.Exists(Path.Combine(_backupPath, snapshotName)))
            {
                throw new BadRequestException("Snapshot không tồn tại");
            }
            await _backupRepository.DeleteSnapshot(snapshotName);
            return new ApiSuccessResult<string>(snapshotName);
        }

        public async Task<ApiResult<BackupInfoDTO[]>> GetAllSnapshots()
        {
            var fileNames = Directory.GetFiles(Path.Combine(AppContext.BaseDirectory, _config.BackupPath))
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
