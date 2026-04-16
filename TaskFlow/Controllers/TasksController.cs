using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.DTOs;
using TaskFlow.Services;

namespace TaskFlow.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TasksController(TaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
        {
            var result = await _taskService.CreateTask(dto);
            return Ok(result);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            if (dto == null)
                return BadRequest("Body is null");

            try
            {
                // 🔥 لازم تجيب userId الحقيقي (من التوكن مثلاً)
                var userId = 2;
                var result = await _taskService.UpdateStatus(id, userId, dto);

                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(403, "Forbidden");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
      //  [Authorize(Roles = "ProjectManager")]
        [HttpPatch("{id}/assign")]
        public async Task<IActionResult> Assign(int id, [FromBody] AssignTaskDto dto)
        {
            var result = await _taskService.AssignTask(id, currentUserId: 1, dto);
            return Ok(result);
        }
    }
}