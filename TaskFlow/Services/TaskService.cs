using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using TaskFlow.Models;

namespace TaskFlow.Services
{
    public class TaskService
    {
        private readonly ApplicationDbContext _context;

        public TaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==============================
        // 1. Update Task Status
        // ==============================
        public async Task UpdateTaskStatus(int taskId, int userId, string role, TaskFlow.Models.TaskStatus newStatus)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
                throw new Exception("Task not found");

            // Member يغير بس التاسك بتاعه
            if (role == "Member" && task.AssignedMemberId != userId)
                throw new UnauthorizedAccessException("You can only update your own tasks");

            // منع الرجوع لورا
            if ((int)newStatus < (int)task.Status)
                throw new Exception("Invalid status transition");

            task.Status = newStatus;

            await _context.SaveChangesAsync();
        }

        // ==============================
        // 2. Assign Task (PM only)
        // ==============================
        public async Task AssignTask(int taskId, string role, int assignedUserId)
        {
            if (role != "ProjectManager")
                throw new UnauthorizedAccessException("Only Project Manager can assign tasks");

            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
                throw new Exception("Task not found");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == assignedUserId);

            if (user == null)
                throw new Exception("User not found");

            // ⚠️ لو عندك ProjectId في User
            if (user.Id != task.ProjectId)
                throw new Exception("User is not part of this project");

            task.AssignedMemberId = assignedUserId;

            await _context.SaveChangesAsync();
        }

        // ==============================
        // 3. Get Project Members
        // ==============================
        public async Task<List<User>> GetProjectMembers(int projectId)
        {
            var projectExists = await _context.Projects
                .AnyAsync(p => p.Id == projectId);

            if (!projectExists)
                throw new Exception("Project not found");

            var members = await _context.Users
                .Where(u => u.Id == projectId)
                .ToListAsync();

            return members;
        }
    }
}