using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using TaskFlow.DTOs;
using TaskFlow.Interfaces;
using TaskFlow.Models;

namespace TaskFlow.Services
{
    public class TaskService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public TaskService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<List<TaskResponseDto>> GetProjectTasksAsync(int projectId)
        {
            await EnsureProjectExistsAsync(projectId);

            var assignedUsers = await LoadAssignedUsersAsync();

            var taskRows = await _context.Tasks
                .Where(t => t.ProjectId == projectId)
                .Select(t => new
                {
                    Task = t,
                    CommentsCount = _context.Comments.Count(c => c.TaskId == t.Id),
                    AttachmentsCount = _context.Attachments.Count(a => a.TaskId == t.Id)
                })
                .OrderBy(t => t.Task.DueDate)
                .ToListAsync();

            return taskRows
                .Select(item => MapTaskResponse(
                    item.Task,
                    assignedUsers,
                    commentsCount: item.CommentsCount,
                    attachmentsCount: item.AttachmentsCount))
                .ToList();
        }

        public async Task<List<TaskResponseDto>> GetAllTasksAsync(int userId, string? role)
        {
            var assignedUsers = await LoadAssignedUsersAsync();
            var projects = await LoadProjectNamesAsync();

            IQueryable<TaskItem> tasksQuery = _context.Tasks;

            if (role == "Member")
            {
                tasksQuery = tasksQuery.Where(t => t.AssignedMemberId == userId);
            }
            else if (role == "ProjectManager")
            {
                var pmProjects = await _context.Projects
                    .Where(p => p.ProjectManagerId == userId && !p.IsDeleted)
                    .Select(p => p.Id)
                    .ToListAsync();

                tasksQuery = tasksQuery.Where(t => pmProjects.Contains(t.ProjectId));
            }

            var taskRows = await tasksQuery
                .Select(t => new
                {
                    Task = t,
                    CommentsCount = _context.Comments.Count(c => c.TaskId == t.Id),
                    AttachmentsCount = _context.Attachments.Count(a => a.TaskId == t.Id)
                })
                .OrderBy(t => t.Task.DueDate)
                .ToListAsync();

            return taskRows
                .Select(item => MapTaskResponse(
                    item.Task,
                    assignedUsers,
                    projects.TryGetValue(item.Task.ProjectId, out var projectName) ? projectName : string.Empty,
                    commentsCount: item.CommentsCount,
                    attachmentsCount: item.AttachmentsCount))
                .ToList();
        }

        public async Task<TaskResponseDto> GetTaskByIdAsync(int taskId)
        {
            var task = await _context.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            var assignedUsers = await LoadAssignedUsersAsync();

            var comments = await (
                    from comment in _context.Comments
                    join user in _context.Users on comment.UserId equals user.Id into commentUsers
                    from user in commentUsers.DefaultIfEmpty()
                    where comment.TaskId == taskId
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
                .Where(a => a.TaskId == taskId)
                .Select(a => new TaskAttachmentResponseDto
                {
                    Id = a.Id,
                    FilePath = a.FilePath
                })
                .ToListAsync();

            return MapTaskResponse(
                task,
                assignedUsers,
                task.Project?.Name ?? string.Empty,
                comments,
                attachments,
                comments.Count,
                attachments.Count);
        }

        public async Task<TaskResponseDto> CreateTaskAsync(int projectId, int currentUserId, TaskCreateRequestDto dto)
        {
            var currentUser = await GetCurrentUserAsync(currentUserId);
            EnsureCanInteractWithTasks(currentUser);

            var project = await GetOwnedProjectAsync(projectId, currentUserId);
            if (project == null)
            {
                throw new KeyNotFoundException("Project not found or you do not have access to it.");
            }

            if (dto.AssignedUserId.HasValue)
            {
                var assignedUser = await GetUserAsync(dto.AssignedUserId.Value);
                if (assignedUser == null)
                {
                    throw new KeyNotFoundException("Assigned user not found.");
                }

                if (assignedUser.Role != Role.Member)
                {
                    throw new ArgumentException("You can only assign tasks to Members.");
                }
            }

            if (dto.DueDate.HasValue && project.EndDate.HasValue && dto.DueDate.Value > project.EndDate.Value)
            {
                throw new ArgumentException("Task due date cannot be after project end date.");
            }

            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description ?? string.Empty,
                CreatedByUserId = currentUserId,
                AssignedMemberId = dto.AssignedUserId,
                ProjectId = projectId,
                Priority = dto.Priority.ToString(),
                DueDate = dto.DueDate ?? DateTime.UtcNow,
                Status = dto.Status
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            if (task.AssignedMemberId.HasValue)
            {
                await _notificationService.SendTaskNotification(
                    task.AssignedMemberId.Value.ToString(),
                    $"You have been assigned a new task: {task.Title}",
                    task.Id);
            }

            return await GetTaskByIdAsync(task.Id);
        }

        public async Task<TaskResponseDto> UpdateTaskAsync(int taskId, int currentUserId, TaskUpdateRequestDto dto)
        {
            var currentUser = await GetCurrentUserAsync(currentUserId);
            EnsureCanInteractWithTasks(currentUser);

            var task = await _context.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            var project = await GetOwnedProjectAsync(task.ProjectId, currentUserId);
            if (project == null)
            {
                throw new KeyNotFoundException("Project not found or you do not have access to it.");
            }

            var previousAssignedUserId = task.AssignedMemberId;

            if (dto.AssignedUserId.HasValue)
            {
                var assignedUser = await GetUserAsync(dto.AssignedUserId.Value);
                if (assignedUser == null)
                {
                    throw new KeyNotFoundException("Assigned user not found.");
                }

                if (assignedUser.Role != Role.Member)
                {
                    throw new ArgumentException("You can only assign tasks to Members.");
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
                if (project.EndDate.HasValue && dto.DueDate.Value > project.EndDate.Value)
                {
                    throw new ArgumentException("Task due date cannot be after project end date.");
                }

                task.DueDate = dto.DueDate.Value;
            }

            if (dto.Status.HasValue)
            {
                task.Status = dto.Status.Value;
            }

            await _context.SaveChangesAsync();

            if (dto.AssignedUserId.HasValue && previousAssignedUserId != dto.AssignedUserId.Value)
            {
                await _notificationService.SendTaskNotification(
                    dto.AssignedUserId.Value.ToString(),
                    $"You have been assigned a new task: {task.Title}",
                    task.Id);
            }

            return await GetTaskByIdAsync(task.Id);
        }

        public async Task DeleteTaskAsync(int taskId, int currentUserId)
        {
            var currentUser = await GetCurrentUserAsync(currentUserId);
            EnsureCanInteractWithTasks(currentUser);

            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            var project = await GetOwnedProjectAsync(task.ProjectId, currentUserId);
            if (project == null)
            {
                throw new KeyNotFoundException("Project not found or you do not have access to it.");
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateTaskStatusAsync(int taskId, int currentUserId, string? role, TaskFlow.Models.TaskStatus newStatus)
        {
            var currentUser = await GetCurrentUserAsync(currentUserId);
            EnsureCanInteractWithTasks(currentUser);

            if (!Enum.IsDefined(typeof(TaskFlow.Models.TaskStatus), newStatus))
            {
                throw new ArgumentException("Invalid status value.");
            }

            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            if (role == "Member" && task.AssignedMemberId != currentUserId)
            {
                throw new UnauthorizedAccessException("You can only update your own tasks.");
            }

            if ((int)newStatus < (int)task.Status)
            {
                throw new ArgumentException("Invalid status transition.");
            }

            task.Status = newStatus;
            await _context.SaveChangesAsync();
        }

        public async Task AssignTaskAsync(int taskId, int currentUserId, int assignedUserId)
        {
            var currentUser = await GetCurrentUserAsync(currentUserId);
            EnsureCanInteractWithTasks(currentUser);

            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null)
            {
                throw new KeyNotFoundException("Task not found.");
            }

            var user = await GetUserAsync(assignedUserId);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            if (user.Role != Role.Member)
            {
                throw new ArgumentException("You can only assign tasks to Members.");
            }

            task.AssignedMemberId = assignedUserId;
            await _context.SaveChangesAsync();

            await _notificationService.SendTaskNotification(
                assignedUserId.ToString(),
                $"You have been assigned a new task: {task.Title}",
                task.Id);
        }

        public async Task<List<SystemUserDto>> GetProjectMembersAsync(int projectId, int currentUserId, string? role)
        {
            await EnsureProjectExistsAsync(projectId);

            IQueryable<User> membersQuery = _context.Users.Where(u => u.Role == Role.Member);

            if (role == "Member")
            {
                membersQuery = membersQuery.Where(u => u.Id == currentUserId);
            }

            return await membersQuery
                .Select(u => new SystemUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt,
                    IsApproved = u.IsApproved,
                    IsRejected = u.IsRejected,
                    CanInteractWithTasks = u.CanInteractWithTasks,
                    CanComment = u.CanComment,
                    CanAttachFiles = u.CanAttachFiles
                })
                .ToListAsync();
        }

        private async Task EnsureProjectExistsAsync(int projectId)
        {
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId && !p.IsDeleted);
            if (!projectExists)
            {
                throw new KeyNotFoundException("Project not found.");
            }
        }

        private async Task<Project?> GetOwnedProjectAsync(int projectId, int currentUserId)
        {
            return await _context.Projects.FirstOrDefaultAsync(p =>
                p.Id == projectId &&
                !p.IsDeleted &&
                p.ProjectManagerId == currentUserId);
        }

        private async Task<User?> GetCurrentUserAsync(int currentUserId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId);
        }

        private async Task<User?> GetUserAsync(int userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }

        private void EnsureCanInteractWithTasks(User? user)
        {
            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid user token.");
            }

            if (!user.CanInteractWithTasks)
            {
                throw new UnauthorizedAccessException("You do not have permission to interact with tasks.");
            }
        }

        private async Task<IReadOnlyDictionary<int, string>> LoadAssignedUsersAsync()
        {
            return await _context.Users
                .Select(u => new { u.Id, u.FullName })
                .ToDictionaryAsync(u => u.Id, u => u.FullName);
        }

        private async Task<IReadOnlyDictionary<int, string>> LoadProjectNamesAsync()
        {
            return await _context.Projects
                .Where(p => !p.IsDeleted)
                .Select(p => new { p.Id, p.Name })
                .ToDictionaryAsync(p => p.Id, p => p.Name);
        }

        private static TaskResponseDto MapTaskResponse(
            TaskItem task,
            IReadOnlyDictionary<int, string> assignedUsers,
            string projectName = "",
            List<TaskCommentResponseDto>? comments = null,
            List<TaskAttachmentResponseDto>? attachments = null,
            int commentsCount = 0,
            int attachmentsCount = 0)
        {
            var assignedUserName = string.Empty;

            if (task.AssignedMemberId.HasValue && task.AssignedMemberId.Value > 0)
            {
                assignedUsers.TryGetValue(task.AssignedMemberId.Value, out assignedUserName);
            }

            var ownerName = string.Empty;
            assignedUsers.TryGetValue(task.CreatedByUserId, out ownerName);

            return new TaskResponseDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                CreatedByUserId = task.CreatedByUserId,
                CreatedByUserName = ownerName ?? string.Empty,
                AssignedUserId = task.AssignedMemberId.HasValue && task.AssignedMemberId.Value > 0 ? task.AssignedMemberId : null,
                AssignedUserName = assignedUserName ?? string.Empty,
                ProjectId = task.ProjectId,
                ProjectName = projectName,
                Priority = ParsePriority(task.Priority),
                DueDate = task.DueDate,
                Status = task.Status,
                Comments = comments ?? new List<TaskCommentResponseDto>(),
                Attachments = attachments ?? new List<TaskAttachmentResponseDto>(),
                CommentsCount = commentsCount,
                AttachmentsCount = attachmentsCount
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