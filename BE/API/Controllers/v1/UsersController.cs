using Core.DTOs.User;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v1/user")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService userService;
        private readonly IVNAddressDataService addressDataService;

        public UsersController(IUserService userService, IVNAddressDataService addressDataService)
        {
            this.userService = userService;
            this.addressDataService = addressDataService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            return Ok(await userService.GetProfile(User));
        }

        [HttpGet("address")]
        public async Task<IActionResult> GetAddresses()
        {
            return Ok(await userService.GetAddresses(User));
        }

        [HttpGet("address/config")]
        public IActionResult GetAddressConfigData()
        {
            return Ok(addressDataService.GetConfigData());
        }

        [HttpPost("address")]
        public async Task<IActionResult> AddAddress([FromBody] AddressDTO data)
        {
            return Ok(await userService.AddAddress(User, data));
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdatetProfile([FromForm]UpdateUserProfileDTO data)
        {
            return Ok(await userService.UpdateProfile(User, data));
        }

        //[HttpPut("address/{addressId}")]
        //public async Task<IActionResult> UpdateAddress(string addressId, [FromBody] AddressDTO data)
        //{
        //    return Ok(await userService.UpdateAddress(User, addressId, data));
        //}

        [HttpPut("address/{addressId}/set-default")]
        public async Task<IActionResult> SetDefaultAddress(string addressId)
        {
            return Ok(await userService.SetDefaultAddress(User, addressId));
        }

        [HttpDelete("address/{addressId}")]
        public async Task<IActionResult> RemoveAddress(string addressId)
        {
            return Ok(await userService.RemoveAddress(User, addressId));
        }
    }
}
