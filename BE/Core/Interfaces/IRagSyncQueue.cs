using System;
using System.Threading;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IRagSyncQueue
    {
        ValueTask EnqueueBookIdAsync(Guid bookId);
        ValueTask<Guid> DequeueBookIdAsync(CancellationToken cancellationToken);
    }
}
