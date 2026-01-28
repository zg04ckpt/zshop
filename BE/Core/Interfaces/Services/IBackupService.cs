using Core.DTOs.Backup;
using Core.DTOs.Common;

namespace Core.Interfaces.Services
{
    public interface IBackupService
    {
        Task<ApiResult<string>> CreateSnapshot(RequestCreateSnapshotDTO request);
        Task<ApiResult<BackupInfoDTO[]>> GetAllSnapshots();
        Task<ApiResult<string>> ApplySnapshot(string snapshotName);
        Task<ApiResult<string>> DeleteSnapshot(string snapshotName);
    }
}
