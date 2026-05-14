using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.DTOs;
using TaskFlow.Services;

namespace TaskFlow.Controllers
{
    [ApiController]
    [Route("api")]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TasksController(TaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet("projects/{projectId:int}/tasks")]
        public async Task<IActionResult> GetProjectTasks(int projectId)
        {
            try
            {
                var tasks = await _taskService.GetProjectTasksAsync(projectId);
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return MapException(ex);
            }
        }

        [HttpGet("tasks")]
        [Authorize]
        public async Task<IActionResult> GetAllTasks()
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (!currentUserId.HasValue || string.IsNullOrWhiteSpace(currentUserRole))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            try
            {
                var tasks = await _taskService.GetAllTasksAsync(currentUserId.Value, currentUserRole);
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return MapException(ex);
            }
        }

        [HttpGet("tasks/{id:int}")]
        public async Task<IActionResult> GetTaskById(int id)
        {
            try
            {
                var task = await _taskService.GetTaskByIdAsync(id);
                return Ok(task);
            }
            catch (Exception ex)
            {
                return MapException(ex);
            }
        }

        [HttpPost("projects/{projectId:int}/tasks")]
        [Authorize(Roles = "ProjectManager")]
        public async Task<IActionResult> CreateTask(int projectId, [FromBody] TaskCreateRequestDto dto)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            try
            {
                var task = await _taskService.CreateTaskAsync(projectId, currentUserId.Value, dto);
                return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, task);
            }
            catch (Exception ex)
            {
                return MapException(ex);
            }
        }

        [HttpPut("tasks/{id:int}")]
        [Authorize(Roles = "ProjectManager")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskUpdateRequestDto dto)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            try
            {
                var task = await _taskService.UpdateTaskAsync(id, currentUserId.Value, dto);
                return Ok(task);
            }
            catch (Exception ex)
            {
                return MapException(ex);
            }
        }

        [HttpDelete("tasks/{id:int}")]
        [Authorize(Roles = "ProjectManager")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            try
            {
                await _taskService.DeleteTaskAsync(id, currentUserId.Value);
                return NoContent();
            }
            catch (Exception ex)
            {
                return MapException(ex);
            }
        }

        [HttpPatch("tasks/{id:int}/status")]
        [Authorize(Roles = "ProjectManager,Member")]
        public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] UpdateTaskStatusDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Invalid request." });
            }

            var currentUserId = GetCurrentUserId();
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (!currentUserId.HasValue || string.IsNullOrWhiteSpace(currentUserRole))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            try
            {
                await _taskService.UpdateTaskStatusAsync(id, currentUserId.Value, currentUserRole, dto.Status);
                return Ok(new { message = "Task status updated successfully." });
            }
            catch (Exception ex)
            {
                return MapException(ex);
            }
        }

        [HttpPatch("tasks/{id:int}/assign")]
        [Authorize(Roles = "ProjectManager")]
        public async Task<IActionResult> AssignTask(int id, [FromBody] AssignTaskDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Invalid request body." });
            }

            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            try
            {
                await _taskService.AssignTaskAsync(id, currentUserId.Value, dto.UserId);
                return Ok(new { message = "Task assigned successfully." });
            }
            catch (Exception ex)
            {
                return MapException(ex);
            }
        }

        [HttpGet("projects/{id:int}/members")]
        [Authorize]
        public async Task<IActionResult> GetProjectMembers(int id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (!currentUserId.HasValue || string.IsNullOrWhiteSpace(currentUserRole))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            try
            {
                var members = await _taskService.GetProjectMembersAsync(id, currentUserId.Value, currentUserRole);
                return Ok(members);
            }
            catch (Exception ex)
            {
                return MapException(ex);
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userIdValue, out var userId) ? userId : null;
        }

        private IActionResult MapException(Exception exception)
        {
            return exception switch
            {
                UnauthorizedAccessException => StatusCode(403, new { message = exception.Message }),
                KeyNotFoundException => NotFound(new { message = exception.Message }),
                ArgumentException => BadRequest(new { message = exception.Message }),
                _ => StatusCode(500, new { message = "An unexpected error occurred." })
            };
        }
    }
}
