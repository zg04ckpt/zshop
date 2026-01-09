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
                if (data.Discount != data.MaxDiscount)
                {
                    throw new BadRequestException("Số tiền giảm giá không thể khác số tiền tối đa");
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
                DiscountType = data.DiscountType,
                MaxDiscount = data.MaxDiscount,
                Quantity = data.Quantity,
                IsActive = true,
                RemainingQuantity = data.Quantity,
                ValidFrom = data.ValidFrom,
                ValidUntil = data.ValidFrom.Add(data.Duration),
            }; 

            while (await _voucherRepo.IsExists(v => v.Code == voucher.Code))
            {
                voucher.Code = Helper.GenerateRandomToken("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);
            }

            await _voucherRepo.Add(voucher);
            await _voucherRepo.Save();

            await _scheduler.ScheduleVoucherActivation(voucher);

            return new ApiSuccessResult<string>(voucher.Id);
        }

        public async Task<ApiResult<string>> ChangeVoucherActivation(string voucherId)
        {
            var voucher = await _voucherRepo.Get(voucherId);
            if (voucher == null)
            {
                throw new BadRequestException("Voucher không tồn tại");
            }

            voucher.IsActive = !voucher.IsActive;

            _voucherRepo.Update(voucher);
            await _voucherRepo.Save();

            return new ApiSuccessResult<string>(
                voucher.IsActive? "Đã kích hoạt voucher!":"Đã khóa voucher!", 
                voucher.Id);
        }

        public async Task<ApiResult<Paginated<VoucherDetailDTO>>> GetVouchers(SearchVoucherDTO data)
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
                // Reset về đầu ngày
                data.Start = Helper.ConvertVNTimeToUTC(data.Start.Value.Date);

                query = query.Where(v => v.ValidFrom >=  data.Start);
            }

            if (data.End is not null)
            {
                // Reset về cuối ngày
                data.End = Helper.ConvertVNTimeToUTC(data.End.Value.Date.AddDays(1).AddTicks(-1));

                query = query.Where(v => v.ValidUntil <= data.End);
            }

            var totalRecords = await query.CountAsync();

            // sort by expire time
            var current = DateTime.UtcNow;
            query = query
                .OrderByDescending(v => v.ValidFrom <= current && v.ValidUntil >= current)
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
                    IsActive = voucher.IsActive,
                    Quantity = voucher.Quantity,
                    RemainingQuantity = voucher.RemainingQuantity,
                    ValidFrom = voucher.ValidFrom,
                    ValidUntil = voucher.ValidUntil
                })
                .ToArrayAsync();

            foreach (var item in vouchers)
            {
                item.Status = GetStatus(item.ValidFrom, item.ValidUntil);
            }

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
                IsActive = voucher.IsActive,
                DiscountType = voucher.DiscountType,
                MaxDiscount = voucher.MaxDiscount,
                Name = voucher.Name,
                Quantity = voucher.Quantity,
                RemainingQuantity = voucher.RemainingQuantity,
                Status = GetStatus(voucher.ValidFrom, voucher.ValidUntil),
                ValidFrom = voucher.ValidFrom,
                ValidUntil = voucher.ValidUntil
            });
        }

        public async Task<ApiResult<VoucherListItemDTO[]>> GetAllVouchers()
        {
            var vouchers = await _voucherRepo.GetQuery()
                .Select(v => new VoucherListItemDTO
                {
                    Id = v.Id,
                    Name = v.Name,
                }).ToArrayAsync();

            return new ApiSuccessResult<VoucherListItemDTO[]>(vouchers);
        }

        public async Task<ApiResult<string>> DeleteVoucher(string voucherId)
        {
            var voucher = await _voucherRepo.Get(voucherId);
            if (voucher == null)
            {
                throw new BadRequestException("Voucher không tồn tại");
            }

            _voucherRepo.Delete(voucher);
            await _voucherRepo.Save();

            return new ApiSuccessResult<string>("Xóa voucher thành công", voucher.Id);
        }
    
        private VoucherStatus GetStatus(DateTime validFrom, DateTime validUtil)
        {
            var current = DateTime.UtcNow;
            if (validFrom > current)
            {
                return VoucherStatus.Created;
            }

            if (current > validUtil)
            {
                return VoucherStatus.Expired;
            }

            return VoucherStatus.Effective;
        }
    }
}
