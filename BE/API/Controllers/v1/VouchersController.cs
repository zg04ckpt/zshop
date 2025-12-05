using Core.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v1/vouchers")]
    [ApiController]
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
    }
}
