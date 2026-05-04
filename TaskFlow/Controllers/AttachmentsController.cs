using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.DTOs;
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
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            try
            {
                var result = await _attachmentService.Upload(id, userId, file);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
        }

        [HttpGet("tasks/{id:int}/attachments")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _attachmentService.GetByTaskId(id);

            return Ok(result.Select(x => new AttachmentDto
            {
                Id = x.Id,
                FileName = x.FileName,
                FileSize = x.FileSize,
                Url = $"{Request.Scheme}://{Request.Host}{x.Url}"
            }));
        }

        [HttpDelete("attachments/{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var userRole = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            try
            {
                await _attachmentService.Delete(id, userId, userRole);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}