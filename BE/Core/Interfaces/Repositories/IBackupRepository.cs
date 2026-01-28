namespace Core.Interfaces.Repositories
{
    public interface IBackupRepository
    {
        Task CreateSnapshot(string snapshotName);
        Task DeleteSnapshot(string snapshotName);
        Task ApplySnapshot(string snapshotName);
    }
}
