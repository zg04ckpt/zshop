using Core.DTOs.Book;
using Core.DTOs.Vouchers;
using Core.Interfaces.Services;
using Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1.Management
{
    [Route("api/v1/management/voucher")]
    [ApiController]
    [Authorize(Policy = "OnlyAdmin")]
    public class VouchersManagementController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public VouchersManagementController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpGet]
        public async Task<IActionResult> GetVouchersAsListItem([FromQuery] SearchVoucherDTO request)
        {
            return Ok(await _voucherService.GetAllVouchers(request));
        }

        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromQuery] CreateVoucherDTO request)
        {
            return Ok(await _voucherService.CreateVoucher(request));
        }

        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(string id)
        {
            return Ok(await _voucherService.DeactivateVoucher(id));
        }
    }
}
