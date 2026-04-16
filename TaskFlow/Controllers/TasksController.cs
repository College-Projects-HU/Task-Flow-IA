using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using TaskFlow.DTOs;
using TaskFlow.Models;

namespace TaskFlow.Controllers
{
    [ApiController]
    [Route("api")]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("projects/{projectId:int}/tasks")]
        public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetProjectTasks(int projectId)
        {
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);
            if (!projectExists)
            {
                return NotFound(new { message = "Project not found." });
            }

            var assignedUsers = await _context.Users
                .Select(u => new { u.Id, u.FullName })
                .ToDictionaryAsync(u => u.Id, u => u.FullName);

            var tasks = await _context.Tasks
                .Where(t => t.ProjectId == projectId)
                .OrderBy(t => t.DueDate)
                .ToListAsync();

            var response = tasks
                .Select(task => MapTaskResponse(task, assignedUsers))
                .ToList();

            return Ok(response);
        }

        [HttpGet("tasks/{id:int}")]
        public async Task<ActionResult<TaskResponseDto>> GetTaskById(int id)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
            if (task == null)
            {
                return NotFound(new { message = "Task not found." });
            }

            var assignedUsers = await _context.Users
                .Select(u => new { u.Id, u.FullName })
                .ToDictionaryAsync(u => u.Id, u => u.FullName);

            var comments = await (from comment in _context.Comments
                                  join user in _context.Users on comment.UserId equals user.Id into commentUsers
                                  from user in commentUsers.DefaultIfEmpty()
                                  where comment.TaskId == id
                                  orderby comment.CreatedAt
                                  select new TaskCommentResponseDto
                                  {
                                      Id = comment.Id,
                                      Content = comment.Content,
                                      UserId = comment.UserId,
                                      UserName = user != null ? user.FullName : string.Empty,
                                      CreatedAt = comment.CreatedAt
                                  })
                .ToListAsync();

            var attachments = await _context.Attachments
                .Where(a => a.TaskId == id)
                .Select(a => new TaskAttachmentResponseDto
                {
                    Id = a.Id,
                    FilePath = a.FilePath
                })
                .ToListAsync();

            var response = MapTaskResponse(task, assignedUsers, comments, attachments);
            return Ok(response);
        }

        [HttpPost("projects/{projectId:int}/tasks")]
        [Authorize(Roles = "ProjectManager")]
        public async Task<ActionResult<TaskResponseDto>> CreateTask(int projectId, TaskCreateRequestDto dto)
        {
            var project = await GetOwnedProjectAsync(projectId);
            if (project == null)
            {
                return NotFound(new { message = "Project not found or you do not have access to it." });
            }

            if (dto.AssignedUserId.HasValue)
            {
                var assignedUserExists = await _context.Users.AnyAsync(u => u.Id == dto.AssignedUserId.Value);
                if (!assignedUserExists)
                {
                    return BadRequest(new { message = "Assigned user not found." });
                }
            }

            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description ?? string.Empty,
                AssignedMemberId = dto.AssignedUserId ?? 0,
                ProjectId = projectId,
                Priority = dto.Priority.ToString(),
                DueDate = dto.DueDate ?? DateTime.UtcNow,
                Status = dto.Status
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            var assignedUsers = await _context.Users
                .Select(u => new { u.Id, u.FullName })
                .ToDictionaryAsync(u => u.Id, u => u.FullName);

            var response = MapTaskResponse(task, assignedUsers);

            return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, response);
        }

        [HttpPut("tasks/{id:int}")]
        [Authorize(Roles = "ProjectManager")]
        public async Task<ActionResult<TaskResponseDto>> UpdateTask(int id, TaskUpdateRequestDto dto)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
            if (task == null)
            {
                return NotFound(new { message = "Task not found." });
            }

            var project = await GetOwnedProjectAsync(task.ProjectId);
            if (project == null)
            {
                return NotFound(new { message = "Project not found or you do not have access to it." });
            }

            if (dto.AssignedUserId.HasValue)
            {
                var assignedUserExists = await _context.Users.AnyAsync(u => u.Id == dto.AssignedUserId.Value);
                if (!assignedUserExists)
                {
                    return BadRequest(new { message = "Assigned user not found." });
                }

                task.AssignedMemberId = dto.AssignedUserId.Value;
            }

            if (dto.Title != null)
            {
                task.Title = dto.Title;
            }

            if (dto.Description != null)
            {
                task.Description = dto.Description;
            }

            if (dto.Priority.HasValue)
            {
                task.Priority = dto.Priority.Value.ToString();
            }

            if (dto.DueDate.HasValue)
            {
                task.DueDate = dto.DueDate.Value;
            }

            if (dto.Status.HasValue)
            {
                task.Status = dto.Status.Value;
            }

            await _context.SaveChangesAsync();

            var assignedUsers = await _context.Users
                .Select(u => new { u.Id, u.FullName })
                .ToDictionaryAsync(u => u.Id, u => u.FullName);

            var comments = await (from comment in _context.Comments
                                  join user in _context.Users on comment.UserId equals user.Id into commentUsers
                                  from user in commentUsers.DefaultIfEmpty()
                                  where comment.TaskId == id
                                  orderby comment.CreatedAt
                                  select new TaskCommentResponseDto
                                  {
                                      Id = comment.Id,
                                      Content = comment.Content,
                                      UserId = comment.UserId,
                                      UserName = user != null ? user.FullName : string.Empty,
                                      CreatedAt = comment.CreatedAt
                                  })
                .ToListAsync();

            var attachments = await _context.Attachments
                .Where(a => a.TaskId == id)
                .Select(a => new TaskAttachmentResponseDto
                {
                    Id = a.Id,
                    FilePath = a.FilePath
                })
                .ToListAsync();

            var response = MapTaskResponse(task, assignedUsers, comments, attachments);
            return Ok(response);
        }

        [HttpDelete("tasks/{id:int}")]
        [Authorize(Roles = "ProjectManager")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
            if (task == null)
            {
                return NotFound(new { message = "Task not found." });
            }

            var project = await GetOwnedProjectAsync(task.ProjectId);
            if (project == null)
            {
                return NotFound(new { message = "Project not found or you do not have access to it." });
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<Project?> GetOwnedProjectAsync(int projectId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return null;
            }

            return await _context.Projects.FirstOrDefaultAsync(p =>
                p.Id == projectId && p.ProjectManagerId == currentUserId.Value);
        }

        private int? GetCurrentUserId()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userIdValue, out var userId) ? userId : null;
        }

        private static TaskResponseDto MapTaskResponse(
            TaskItem task,
            IReadOnlyDictionary<int, string> assignedUsers,
            List<TaskCommentResponseDto>? comments = null,
            List<TaskAttachmentResponseDto>? attachments = null)
        {
            assignedUsers.TryGetValue(task.AssignedMemberId, out var assignedUserName);

            return new TaskResponseDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                AssignedUserId = task.AssignedMemberId > 0 ? task.AssignedMemberId : null,
                AssignedUserName = assignedUserName ?? string.Empty,
                Priority = ParsePriority(task.Priority),
                DueDate = task.DueDate,
                Status = task.Status,
                Comments = comments ?? new List<TaskCommentResponseDto>(),
                Attachments = attachments ?? new List<TaskAttachmentResponseDto>()
            };
        }

        private static TaskPriority ParsePriority(string priority)
        {
            return Enum.TryParse<TaskPriority>(priority, true, out var parsedPriority)
                ? parsedPriority
                : TaskPriority.Low;
        }
    }
}
