using Core.Entities.VoucherFeature;
using Core.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Core.BackgroundTasks
{
    public class ChangeVoucherStatusTask : BackgroundService
    {
        private readonly ChangeVoucherStatusTaskConfig _config;
        private readonly ILogger<ChangeVoucherStatusTask> _logger;
        private readonly IVoucherRepository _voucherRepo;

        public ChangeVoucherStatusTask(
            IOptions<ChangeVoucherStatusTaskConfig> options,
            ILogger<ChangeVoucherStatusTask> logger,
            IVoucherRepository voucherRepo)
        {
            _config = options.Value;
            _logger = logger;
            _voucherRepo = voucherRepo;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("ChangeVoucherStatusTask started");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Starting checking at {time}", DateTime.Now);

                    // Check and update
                    var current = DateTime.Now;
                    var activeVouchers = await _voucherRepo.GetQuery()
                        //.Where(v => v.Status == VoucherStatus.Created)
                        .ToListAsync(stoppingToken);

                    _logger.LogInformation($"{activeVouchers.Count} vouchers need to update");

                    var toUpdate = new List<Voucher>();
                    foreach (var voucher in activeVouchers)
                    {
                        if (voucher.ValidFrom > current)
                        {
                            //voucher.Status = VoucherStatus.Created;
                            toUpdate.Add(voucher);
                        }
                    }

                    _voucherRepo.UpdateRange(toUpdate);
                    await _voucherRepo.Save();

                    _logger.LogInformation("Starting ChangeVoucherStatusTask at {time}", DateTime.Now);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("ChangeVoucherStatusTask error: " + ex.Message);
                }
            }
        }
    }

    public class ChangeVoucherStatusTaskConfig
    {
        public int IntervalMinutes { get; set; }
    }
}
