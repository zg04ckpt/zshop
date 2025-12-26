using Core.DTOs.Book;
using Core.DTOs.Vouchers;
using Core.Interfaces.Services;
using Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1.Management
{
    [Route("api/v1/management/vouchers")]
    [ApiController]
    [Authorize(Policy = "OnlyAdmin")]
    public class VouchersManagementController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public VouchersManagementController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetVouchersAsListItem()
        {
            return Ok(await _voucherService.GetAllVouchers());
        }

        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherDTO request)
        {
            return Ok(await _voucherService.CreateVoucher(request));
        }

        [HttpPost("{id}/change-activation")]
        public async Task<IActionResult> ChangeVoucherActivation(string id)
        {
            return Ok(await _voucherService.ChangeVoucherActivation(id));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoucher(string id)
        {
            return Ok(await _voucherService.DeleteVoucher(id));
        }
    }
}
