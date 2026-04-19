using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.Services;

namespace TaskFlow.Controllers
{
    [ApiController]
    [Route("api")]
    public class AttachmentsController : ControllerBase
    {
        private readonly AttachmentService _attachmentService;

        public AttachmentsController(AttachmentService attachmentService)
        {
            _attachmentService = attachmentService;
        }

        [HttpPost("tasks/{id:int}/attachments")]
        [Authorize]
        public async Task<IActionResult> Upload(int id, IFormFile file)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

                var result = await _attachmentService.Upload(id, userId, file);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("tasks/{id:int}/attachments")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _attachmentService.GetByTaskId(id);
            return Ok(result);
        }
    }
}