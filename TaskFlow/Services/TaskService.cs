using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using TaskFlow.Models;
using TaskFlow.Interfaces;
using TaskFlow.DTOs; // تأكدي إن الـ DTOs موجودة هنا

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

        // ==========================================
        // 1. Update Task (الشاشة اللي في الصورة)
        // ==========================================
        public async Task UpdateTask(int taskId, UpdateTaskFullDto dto, int currentUserId)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null) throw new Exception("Task not found");

            // حفظ القيم القديمة للمقارنة
            var oldStatus = task.Status;
            var oldPriority = task.Priority;
            var oldMemberId = task.AssignedMemberId;

            // تحديث البيانات من الـ DTO
            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Priority = dto.Priority;
            task.Status = dto.Status;
            task.DueDate = dto.DueDate;
            task.AssignedMemberId = dto.AssignedMemberId;

            await _context.SaveChangesAsync();

            // --- 🔔 إرسال الإشعار للموظف المسؤول عن التاسك ---
            if (task.AssignedMemberId.HasValue && task.AssignedMemberId != currentUserId)
            {
                var updater = await _context.Users.FindAsync(currentUserId);
                string changeMessage = $"Your task '{task.Title}' was updated by {updater?.FullName}.";

                if (oldStatus != task.Status)
                    changeMessage += $" Status: {task.Status}.";
                
                if (oldPriority != task.Priority)
                    changeMessage += $" Priority: {task.Priority}.";

                await _notificationService.SendTaskNotification(
                    task.AssignedMemberId.Value.ToString(),
                    changeMessage,
                    task.Id
                );
            }
        }

        // ==========================================
        // 2. Update Task Status (تغيير الحالة السريع)
        // ==========================================
        public async Task UpdateTaskStatus(int taskId, int userId, string role, TaskFlow.Models.TaskStatus newStatus)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null) throw new Exception("Task not found");

            if (!Enum.IsDefined(typeof(TaskFlow.Models.TaskStatus), newStatus))
                throw new Exception("Invalid status value");

            if (role == "Member" && task.AssignedMemberId != userId)
                throw new UnauthorizedAccessException("You can only update your own tasks");

            if ((int)newStatus < (int)task.Status)
                throw new Exception("Invalid status transition");

            task.Status = newStatus;
            await _context.SaveChangesAsync();

            // إحضار الـ Project Manager لإرسال إشعار له
            var projectManagerId = await _context.Projects
                .Where(p => p.Id == task.ProjectId)
                .Select(p => p.ProjectManagerId)
                .FirstOrDefaultAsync();

            if (projectManagerId > 0 && userId != projectManagerId)
            {
                var user = await _context.Users.FindAsync(userId);
                await _notificationService.SendTaskNotification(
                    projectManagerId.ToString(),
                    $"{user?.FullName ?? "A member"} updated status of '{task.Title}' to {newStatus}",
                    task.Id
                );
            }
        }

        // ==========================================
        // 3. Assign Task (PM only)
        // ==========================================
        public async Task AssignTask(int taskId, string role, int assignedUserId)
        {
            if (role != "ProjectManager")
                throw new UnauthorizedAccessException("Only Project Manager can assign tasks");

            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null) throw new Exception("Task not found");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == assignedUserId);
            if (user == null) throw new Exception("User not found");

            if (user.Role != Role.Member)
                throw new Exception("You can only assign tasks to Members");

            task.AssignedMemberId = assignedUserId;
            await _context.SaveChangesAsync();

            await _notificationService.SendTaskNotification(
                assignedUserId.ToString(),
                $"You have been assigned to a new task: {task.Title}",
                task.Id
            );
        }

        // ==========================================
        // 4. Get Project Members
        // ==========================================
        public async Task<List<User>> GetProjectMembers(int projectId)
        {
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);
            if (!projectExists) throw new Exception("Project not found");

            return await _context.Users
                .Where(u => u.Id == projectId) 
                .ToListAsync();
        }
    }
}