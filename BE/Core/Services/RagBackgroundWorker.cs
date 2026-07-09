using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Core.Interfaces;

namespace Core.Services
{
    public class RagBackgroundWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RagBackgroundWorker> _logger;

        public RagBackgroundWorker(
            IServiceProvider serviceProvider,
            ILogger<RagBackgroundWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("RAG Auto-Sync Background Worker is running.");
            
            // Run every 1 minute
            using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var orchestrator = scope.ServiceProvider.GetRequiredService<IRagOrchestratorService>();
                        await orchestrator.RunAutoSyncBatchAsync();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing RAG sync task.");
                }

                // Wait for the next tick
                await timer.WaitForNextTickAsync(stoppingToken);
            }
        }
    }
}
