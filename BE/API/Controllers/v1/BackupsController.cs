using Core.DTOs.Backup;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.v1
{
    [Route("api/v{version:apiVersion}/backups")]
    [ApiController]
    [ApiVersion("1.0")]
    [Authorize(Policy = "OnlyAdmin")]
    public class BackupsController : ControllerBase
    {
        private readonly IBackupService _backupService;

        public BackupsController(IBackupService backupService)
        {
            _backupService = backupService;
        }

        [HttpGet]
        public async Task<IActionResult> GetListSnapshotVersions()
        {
            var res = await _backupService.GetAllSnapshots();
            return Ok(res);
        }

        [HttpPost]
        public async Task<IActionResult> CreateNewSnapshot([FromBody] RequestCreateSnapshotDTO request)
        {
            var res = await _backupService.CreateSnapshot(request);
            return Ok(res);
        }

        [HttpPost("apply")]
        public async Task<IActionResult> ApplySnapshot([FromBody] RequestApplySnapshotDTO request)
        {
            var res = await _backupService.ApplySnapshot(request.SnapshotName);
            return Ok(res);
        }

        [HttpPost("delete")]
        public async Task<IActionResult> DeleteSnapshot([FromBody] RequestDeleteSnapshotDTO request)
        {
            var res = await _backupService.DeleteSnapshot(request.SnapshotName);
            return Ok(res);
        }
    }
}
