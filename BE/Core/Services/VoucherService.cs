using Core.DTOs.Common;
using Core.DTOs.Vouchers;
using Core.Entities.VoucherFeature;
using Core.Exceptions;
using Core.Interfaces;
using Core.Interfaces.Services;
using Core.Utilities;
using LinqKit;

namespace Core.Services
{
    public class VoucherService : IVoucherService
    {
        private readonly IUnitOfWork _unitOfWork;

        public VoucherService(
            IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResult<string>> CreateVoucher(CreateVoucherDTO data)
        {
            if (await _unitOfWork.Repository<Voucher>().ExistsAsync(v => v.Name == data.Name))
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
                ValidFrom = data.ValidFrom,
                ValidUntil = data.ValidFrom.Add(data.Duration),
            }; 

            while (await _unitOfWork.Repository<Voucher>().ExistsAsync(v => v.Code == voucher.Code))
            {
                voucher.Code = Helper.GenerateRandomToken("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);
            }

            await _unitOfWork.Repository<Voucher>().AddAsync(voucher);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult<string>(voucher.Id);
        }

        public async Task<ApiResult<string>> ChangeVoucherActivation(string voucherId)
        {
            var voucher = await _unitOfWork.Repository<Voucher>().GetFirstAsync(e => e.Id == voucherId)
                ?? throw new BadRequestException("Voucher không tồn tại");

            voucher.IsActive = !voucher.IsActive;

            await _unitOfWork.Repository<Voucher>().UpdateAsync(voucher);
            await _unitOfWork.SaveChangesAsync();

            return new ApiSuccessResult<string>(
                voucher.IsActive? "Đã kích hoạt voucher!":"Đã khóa voucher!", 
                voucher.Id);
        }

        public async Task<ApiResult<Paginated<VoucherDetailDTO>>> GetVouchers(SearchVoucherDTO data)
        {
            var filter = PredicateBuilder.New<Voucher>(true);

            // filter
            if (!string.IsNullOrEmpty(data.Code))
            {
                filter.And(v => v.Code == data.Code);
            }

            if (!string.IsNullOrEmpty(data.Name))
            {
                filter.And(v => v.Name.Contains(data.Name));
            }

            if (data.Start is not null)
            {
                // Reset về đầu ngày
                data.Start = Helper.ConvertVNTimeToUTC(data.Start.Value.Date);
                filter.And(v => v.ValidFrom >=  data.Start);
            }

            if (data.End is not null)
            {
                // Reset về cuối ngày
                data.End = Helper.ConvertVNTimeToUTC(data.End.Value.Date.AddDays(1).AddTicks(-1));
                filter.And(v => v.ValidUntil <= data.End);
            }

            var current = DateTime.UtcNow;

            var vouchers = await _unitOfWork.Repository<Voucher>().GetPagingAsync(
                predicate: filter,
                pageIndex: data.PageIndex,
                pageSize: data.PageSize,
                selector: voucher => new VoucherDetailDTO
                {
                    Id = voucher.Id,
                    Code = voucher.Code,
                    Discount = voucher.Discount,
                    DiscountType = voucher.DiscountType,
                    MaxDiscount = voucher.MaxDiscount,
                    Name = voucher.Name,
                    IsActive = voucher.IsActive,
                    Quantity = voucher.Quantity,
                    RemainingQuantity = voucher.Quantity - voucher.AppliedOrders.Count,
                    ValidFrom = voucher.ValidFrom,
                    ValidUntil = voucher.ValidUntil
                },
                orderBy: v => v.ValidFrom <= current && v.ValidUntil >= current,
                asc: false);

            
            //query = query
            //    .OrderByDescending(v => v.ValidFrom <= current && v.ValidUntil >= current)
            //    .ThenByDescending(v => v.ValidFrom);

            // paging & project

            foreach (var item in vouchers.Items)
            {
                item.Status = GetStatus(item.ValidFrom, item.ValidUntil);
            }

            return new ApiSuccessResult<Paginated<VoucherDetailDTO>>(vouchers);
        }

        public async Task<ApiResult<VoucherDetailDTO>> GetVoucherById(string voucherId)
        {
            var voucher = await _unitOfWork.Repository<Voucher>().GetFirstAsync(
                predicate: e => e.Id == voucherId,
                selector: voucher => new VoucherDetailDTO
                {
                    Id = voucher.Id,
                    Code = voucher.Code,
                    Discount = voucher.Discount,
                    IsActive = voucher.IsActive,
                    DiscountType = voucher.DiscountType,
                    MaxDiscount = voucher.MaxDiscount,
                    Name = voucher.Name,
                    Quantity = voucher.Quantity,
                    RemainingQuantity = voucher.Quantity - voucher.AppliedOrders.Count,
                    Status = GetStatus(voucher.ValidFrom, voucher.ValidUntil),
                    ValidFrom = voucher.ValidFrom,
                    ValidUntil = voucher.ValidUntil
                })
                ?? throw new BadRequestException("Voucher không tồn tại");

            return new ApiSuccessResult<VoucherDetailDTO>(voucher);
        }

        public async Task<ApiResult<VoucherListItemDTO[]>> GetAllVouchers()
        {
            var vouchers = await _unitOfWork.Repository<Voucher>().GetAllAsync(
                predicate: e => true,
                selector: v => new VoucherListItemDTO
                {
                    Id = v.Id,
                    Name = v.Name,
                });

            return new ApiSuccessResult<VoucherListItemDTO[]>(vouchers.ToArray());
        }

        public async Task<ApiResult<string>> DeleteVoucher(string voucherId)
        {
            var voucher = await _unitOfWork.Repository<Voucher>().GetFirstAsync(e => e.Id == voucherId)
                ?? throw new BadRequestException("Voucher không tồn tại");

            await _unitOfWork.Repository<Voucher>().DeleteAsync(voucher);
            await _unitOfWork.SaveChangesAsync();

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
