using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using TaskFlow.DTOs;
using TaskFlow.Models;
using TaskStatus = TaskFlow.Models.TaskStatus;

namespace TaskFlow.Services
{
    public class TaskService
    {
        private readonly ApplicationDbContext _context;

        public TaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TaskItem> CreateTask(CreateTaskDto dto)
        {
            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                AssignedMemberId = dto.AssignedMemberId,
                ProjectId = dto.ProjectId,
                Priority = dto.Priority,
                DueDate = dto.DueDate,
                Status = TaskStatus.ToDo // default status
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return task;
        }

        public async Task<TaskItem> UpdateStatus(int taskId, int userId, UpdateStatusDto dto)
        {
            var task = await _context.Tasks.FindAsync(taskId);

            if (task == null)
                throw new Exception("Task not found");

            // 🔒 authorization check
            if (task.AssignedMemberId != userId)
                throw new UnauthorizedAccessException();

            var newStatus = dto.Status;

            if (!IsValidTransition(task.Status, newStatus))
                throw new Exception("Invalid status transition");

            task.Status = newStatus;

            await _context.SaveChangesAsync();

            return task;
        }
        public async Task<TaskDto> AssignTask(int taskId, int currentUserId, AssignTaskDto dto)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null)
                throw new Exception("Task not found");

            var project = await _context.Projects.FindAsync(task.ProjectId);
            if (project == null)
                throw new Exception("Project not found");

            if (project.ProjectManagerId != currentUserId)
                throw new UnauthorizedAccessException();

            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                throw new Exception("User not found");

            task.AssignedMemberId = dto.UserId;

            await _context.SaveChangesAsync();

            return new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status.ToString(),
                AssignedMemberId = task.AssignedMemberId,
                ProjectId = task.ProjectId
            };
        }
        private bool IsValidTransition(TaskFlow.Models.TaskStatus current, TaskFlow.Models.TaskStatus next)
        {
            return (current == TaskFlow.Models.TaskStatus.ToDo && next == TaskFlow.Models.TaskStatus.InProgress) ||
                   (current == TaskFlow.Models.TaskStatus.InProgress && next == TaskFlow.Models.TaskStatus.Done);
        }

        // 🔥 تحويل من System TaskStatus إلى بتاع مشروعك
        private TaskFlow.Models.TaskStatus MapStatus(System.Threading.Tasks.TaskStatus status)
        {
            return status switch
            {
                System.Threading.Tasks.TaskStatus.Canceled => TaskFlow.Models.TaskStatus.ToDo,
                System.Threading.Tasks.TaskStatus.Running => TaskFlow.Models.TaskStatus.InProgress,
                System.Threading.Tasks.TaskStatus.RanToCompletion => TaskFlow.Models.TaskStatus.Done,
                _ => TaskFlow.Models.TaskStatus.ToDo
            };
        }
    }
}