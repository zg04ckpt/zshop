using System;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using Core.Interfaces;

namespace Core.Services
{
    public class RagSyncQueue : IRagSyncQueue
    {
        private readonly Channel<Guid> _queue;

        public RagSyncQueue()
        {
            var options = new BoundedChannelOptions(1000)
            {
                FullMode = BoundedChannelFullMode.Wait
            };
            _queue = Channel.CreateBounded<Guid>(options);
        }

        public async ValueTask EnqueueBookIdAsync(Guid bookId)
        {
            await _queue.Writer.WriteAsync(bookId);
        }

        public async ValueTask<Guid> DequeueBookIdAsync(CancellationToken cancellationToken)
        {
            return await _queue.Reader.ReadAsync(cancellationToken);
        }
    }
}
