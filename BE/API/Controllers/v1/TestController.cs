using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v1/test")]
    [ApiController]
    public class TestController : ControllerBase
    {
        [HttpGet]
        [Authorize]
        public ActionResult Get()
        {
            return Ok("thành công");
        }
    }
}
