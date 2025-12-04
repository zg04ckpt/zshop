using Core.BackgroundTasks;
using Core.DTOs.Common;
using Core.DTOs.Vouchers;
using Core.Entities.VoucherFeature;
using Core.Exceptions;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Utilities;
using Microsoft.EntityFrameworkCore;

namespace Core.Services
{
    public class VoucherService : IVoucherService
    {
        private readonly IVoucherRepository _voucherRepo;
        private readonly VoucherScheduler _scheduler;

        public VoucherService(
            IVoucherRepository voucherRepo, 
            VoucherScheduler scheduler)
        {
            _voucherRepo = voucherRepo;
            _scheduler = scheduler;
        }

        public async Task<ApiResult<string>> CreateVoucher(CreateVoucherDTO data)
        {
            if (await _voucherRepo.IsExists(v => v.Name == data.Name))
            {
                throw new BadRequestException("Tên đã tồn tại");
            }

            // Kiểm tra mức giảm giá hợp lệ
            if (data.DiscountType == DiscountType.Amount)
            {
                if (data.Discount > data.MaxDiscount)
                {
                    throw new BadRequestException("Số tiền giảm giá không thể vượt quá tối đa");
                }
            }
            else
            {
                if (data.Discount <= 0 || data.Discount > 100)
                {
                    throw new BadRequestException("Tỉ lệ giảm giá phải > 0% và <= 100%");
                }
            }

            var voucher = new Voucher
            {
                Id = Guid.NewGuid().ToString(),
                Name = data.Name,
                Code = Helper.GenerateRandomToken("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8),
                Discount = data.Discount,
                DiscountType = DiscountType.Amount,
                MaxDiscount = data.MaxDiscount,
                Status = VoucherStatus.Created,
                Quantity = data.Quantity,
                RemainingQuantity = data.RemainingQuantity,
                ValidFrom = data.ValidFrom,
                ValidUntil = data.ValidFrom.Add(data.Duration)
            }; 

            while (await _voucherRepo.IsExists(v => v.Code == voucher.Code))
            {
                voucher.Code = Helper.GenerateRandomToken("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);
            }

            await _voucherRepo.Add(voucher);
            await _voucherRepo.Save();

            _scheduler.ScheduleVoucherActivation(voucher);

            return new ApiSuccessResult<string>(voucher.Id);
        }

        public async Task<ApiResult<string>> DeactivateVoucher(string voucherId)
        {
            var voucher = await _voucherRepo.Get(voucherId);
            if (voucher == null)
            {
                throw new BadRequestException("Voucher không tồn tại");
            }

            _voucherRepo.Delete(voucher);
            await _voucherRepo.Save();

            return new ApiSuccessResult<string>(voucher.Id);
        }

        public async Task<ApiResult<Paginated<VoucherDetailDTO>>> GetAllVouchers(SearchVoucherDTO data)
        {
            var query = _voucherRepo.GetQuery().AsNoTracking();

            // filter
            if (!string.IsNullOrEmpty(data.Code))
            {
                query = query.Where(v => v.Code == data.Code);
            }

            if (!string.IsNullOrEmpty(data.Name))
            {
                query = query.Where(v => v.Name.Contains(data.Name));
            }

            if (data.Start is not null)
            {
                query = query.Where(v => v.ValidFrom >=  data.Start);
            }

            if (data.End is not null)
            {
                query = query.Where(v => v.ValidUntil <= data.End);
            }

            var totalRecords = await query.CountAsync();

            // sort by expire time
            var current = DateTime.Now;
            query = query
                .OrderByDescending(v => v.Status == VoucherStatus.Created)
                .ThenByDescending(v => v.Status == VoucherStatus.Active)
                .ThenByDescending(v => v.ValidFrom);

            // paging & project
            var vouchers = await query
                .Skip((data.Page - 1) * data.Size)
                .Take(data.Size)
                .Select(voucher => new VoucherDetailDTO
                {
                    Id = voucher.Id,
                    Code = voucher.Code,
                    Discount = voucher.Discount,
                    DiscountType = voucher.DiscountType,
                    MaxDiscount = voucher.MaxDiscount,
                    Name = voucher.Name,
                    Quantity = voucher.Quantity,
                    RemainingQuantity = voucher.RemainingQuantity,
                    Status = voucher.Status,
                    ValidFrom = voucher.ValidFrom,
                    ValidUntil = voucher.ValidUntil
                })
                .ToArrayAsync();

            var totalPage = (int)Math.Ceiling((double)totalRecords / data.Size);
            return new ApiSuccessResult<Paginated<VoucherDetailDTO>>(new Paginated<VoucherDetailDTO>
            {
                TotalPage = totalPage,
                TotalRecord = totalRecords,
                Data = vouchers
            });
        }

        public async Task<ApiResult<VoucherDetailDTO>> GetVoucherById(string voucherId)
        {
            var voucher = await _voucherRepo.Get(voucherId);
            if (voucher == null)
            {
                throw new BadRequestException("Voucher không tồn tại");
            }

            return new ApiSuccessResult<VoucherDetailDTO>(new VoucherDetailDTO
            {
                Id = voucher.Id,
                Code = voucher.Code,
                Discount = voucher.Discount,
                DiscountType = voucher.DiscountType,
                MaxDiscount = voucher.MaxDiscount,
                Name = voucher.Name,
                Quantity = voucher.Quantity,
                RemainingQuantity = voucher.RemainingQuantity,
                Status = voucher.Status,
                ValidFrom = voucher.ValidFrom,
                ValidUntil = voucher.ValidUntil
            });
        }
    }
}
