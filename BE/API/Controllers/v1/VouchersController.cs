using Core.DTOs.Vouchers;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v{version:apiVersion}/vouchers")]
    [ApiController]
    [ApiVersion("1.0")]
    public class VouchersController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public VouchersController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpGet("id")]
        public async Task<IActionResult> GetDetail(string id)
        {
            return Ok(await _voucherService.GetVoucherById(id));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllVouchers([FromQuery] SearchVoucherDTO request)
        {
            return Ok(await _voucherService.GetVouchers(request));
        }

        #region Manage
        [HttpGet("manage/items")]
        [Authorize(Policy = "AllowTest")]
        public async Task<IActionResult> GetVouchersAsListItem()
        {
            return Ok(await _voucherService.GetAllVouchers());
        }

        [HttpPost("manage")]
        [Authorize(Policy = "AllowTest")]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherDTO request)
        {
            return Ok(await _voucherService.CreateVoucher(request));
        }

        [HttpPost("manage/{id}/change-activation")]
        [Authorize(Policy = "AllowTest")]
        public async Task<IActionResult> ChangeVoucherActivation(string id)
        {
            return Ok(await _voucherService.ChangeVoucherActivation(id));
        }

        [HttpDelete("manage/{id}")]
        [Authorize(Policy = "AllowTest")]
        public async Task<IActionResult> DeleteVoucher(string id)
        {
            return Ok(await _voucherService.DeleteVoucher(id));
        }
        #endregion
    }
}
