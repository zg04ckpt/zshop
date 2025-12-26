using Core.Entities.VoucherFeature;
using Core.Interfaces.Repositories;
using Hangfire;
using Microsoft.Extensions.Logging;
using System.ComponentModel;

namespace Core.BackgroundTasks
{
    public class VoucherScheduler
    {
        private readonly ILogger<VoucherScheduler> _logger;
        private readonly IVoucherRepository _voucherRepo;

        public VoucherScheduler(
            IVoucherRepository voucherRepo, 
            ILogger<VoucherScheduler> logger)
        {
            _voucherRepo = voucherRepo;
            _logger = logger;
        }

        public async Task ScheduleVoucherActivation(Voucher voucher)
        {
            var now = DateTime.UtcNow;

            // Kích hoạt
            if (voucher.ValidFrom > now)
            {
                var delayToActive = voucher.ValidFrom - now;
                BackgroundJob.Schedule<VoucherScheduler>(
                    x => x.ActivateVoucherAsync(voucher.Id),
                    delayToActive);
            }
            else
            {
                await ActivateVoucherAsync(voucher.Id);
            }

            // Hết hạn
            if (voucher.ValidUntil > now)
            {
                var delayToExpire = voucher.ValidUntil - now;
                BackgroundJob.Schedule<VoucherScheduler>(
                    x => x.ExpireVoucherAsync(voucher.Id),
                    delayToExpire);
            }
            else
            {
                await ExpireVoucherAsync(voucher.Id);
            }
        }


        [AutomaticRetry(Attempts = 5)] 
        [DisplayName("Activate Voucher {0}")]
        public async Task ActivateVoucherAsync(string voucherId)
        {
            var voucher = await _voucherRepo.Get(voucherId);
            if (voucher == null)
            {
                _logger.LogWarning("Voucher {VoucherId} not found when activating", voucherId);
                return;
            }

            //if (voucher.Status != VoucherStatus.Created)
            //{
            //    _logger.LogInformation("Voucher {VoucherId} not in created status", voucherId);
            //    return;
            //}

            //voucher.Status = VoucherStatus.Effective;
            _voucherRepo.Update(voucher);
            await _voucherRepo.Save();

            _logger.LogInformation("Voucher {VoucherId} activated successfully", voucherId);
        }


        [AutomaticRetry(Attempts = 5)]
        [DisplayName("Expire Voucher {0}")]
        public async Task ExpireVoucherAsync(string voucherId)
        {
            var voucher = await _voucherRepo.Get(voucherId);
            if (voucher == null)
            {
                _logger.LogWarning("Voucher {VoucherId} not found when expiring", voucherId);
                return;
            }

            //if (voucher.Status != VoucherStatus.Effective)
            //{
            //    _logger.LogInformation("Voucher {VoucherId} not in active status", voucherId);
            //    return;
            //}

            //voucher.Status = VoucherStatus.Expired;
            _voucherRepo.Update(voucher);
            await _voucherRepo.Save();

            _logger.LogInformation("Voucher {VoucherId} has been set to expired", voucherId);
        }
    }
}
