using Core.DTOs.User;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v{version:apiVersion}/user")]
    [ApiController]
    [Authorize]
    [ApiVersion("1.0")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IVNAddressDataService addressDataService;

        public UsersController(IUserService userService, IVNAddressDataService addressDataService)
        {
            this._userService = userService;
            this.addressDataService = addressDataService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            return Ok(await _userService.GetProfile(User));
        }

        [HttpGet("address")]
        public async Task<IActionResult> GetAddresses()
        {
            return Ok(await _userService.GetAddresses(User));
        }

        [HttpGet("address/config")]
        public IActionResult GetAddressConfigData()
        {
            return Ok(addressDataService.GetConfigData());
        }

        [HttpPost("address")]
        public async Task<IActionResult> AddAddress([FromBody] AddressDTO data)
        {
            return Ok(await _userService.AddAddress(User, data));
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdatetProfile([FromForm]UpdateUserProfileDTO data)
        {
            return Ok(await _userService.UpdateProfile(User, data));
        }

        [HttpPut("address/{addressId}/set-default")]
        public async Task<IActionResult> SetDefaultAddress(string addressId)
        {
            return Ok(await _userService.SetDefaultAddress(User, addressId));
        }

        [HttpDelete("address/{addressId}")]
        public async Task<IActionResult> RemoveAddress(string addressId)
        {
            return Ok(await _userService.RemoveAddress(User, addressId));
        }

        #region Manage
        [HttpGet("manage")]
        [Authorize(Policy = "OnlyAdmin")]
        public async Task<IActionResult> GetAsListItem([FromQuery] SearchUserDTO data)
        {
            return Ok(await _userService.GetUsersAsList(data));
        }

        [HttpGet("manage/roles")]
        [Authorize(Policy = "OnlyAdmin")]
        public async Task<IActionResult> GetRolesAsSelectItem()
        {
            return Ok(await _userService.GetRoles());
        } 

        [HttpPut("manage/change-active")]
        [Authorize(Policy = "OnlyAdmin")]
        public async Task<IActionResult> SetStatus([FromBody] SetUserActiveDTO request)
        {
            return Ok(await _userService.SetUserActive(request));
        }

        [HttpDelete("manage/{id}")]
        [Authorize(Policy = "OnlyAdmin")]
        public async Task<IActionResult> DeleteAccount(Guid id)
        {
            return Ok(await _userService.DeleteUser(id));
        }
        #endregion
    }
}
