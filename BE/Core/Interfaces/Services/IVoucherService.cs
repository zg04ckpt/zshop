using Core.DTOs.Common;
using Core.DTOs.Vouchers;
using Core.Entities.VoucherFeature;

namespace Core.Interfaces.Services
{
    public interface IVoucherService
    {
        Task<ApiResult<string>> CreateVoucher(CreateVoucherDTO data);
        Task<ApiResult<VoucherDetailDTO>> GetVoucherById(string voucherId);
        Task<ApiResult<Paginated<VoucherDetailDTO>>> GetVouchers(SearchVoucherDTO data);
        Task<ApiResult<VoucherListItemDTO>> GetAllVouchers();
        Task<ApiResult<string>> DeactivateVoucher(string voucherId);
    }
}
