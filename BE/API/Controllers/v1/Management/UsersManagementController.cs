using Core.DTOs.User;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1.Management
{
    [Route("api/v1/management/user")]
    [ApiController]
    [Authorize(Policy = "OnlyAdmin")]
    public class UsersManagementController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersManagementController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsListItem([FromQuery] SearchUserDTO data)
        {
            return Ok(await _userService.GetUsersAsList(data));
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRolesAsSelectItem()
        {
            return Ok(await _userService.GetRoles());
        }
    }
}
