using Microsoft.EntityFrameworkCore;
using System;
using TaskFlow.Data;
using TaskFlow.Models;
using TaskFlow.Interfaces;

namespace TaskFlow.Services
{
    public class CommentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IRepository<Comment> _commentRepo;
        private readonly INotificationService _notificationService; // إضافة السيرفس

        public CommentService(
            ApplicationDbContext context,
            IRepository<Comment> commentRepo,
            INotificationService notificationService)
        {
            _context = context;
            _commentRepo = commentRepo;
            _notificationService = notificationService;
        }

        public async Task<List<Comment>> GetCommentsByTask(int taskId)
        {
            return await _context.Comments
                .Include(c => c.User)
                .Where(c => c.TaskId == taskId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Comment> AddComment(int taskId, int userId, string content)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) throw new Exception("User not found");

        if (!user.CanComment)
            throw new UnauthorizedAccessException("You do not have permission to add comments.");

        var comment = new Comment
        {
            TaskId = taskId,
            UserId = userId,
            Content = content
        } ;

        await _commentRepo.AddAsync(comment);
        await _commentRepo.SaveChangesAsync();

        // --- إرسال الإشعارات (بدون Include) ---
        var task = await _context.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == taskId);
        if (task != null)
        {
            // 1. إرسال للموظف (لو اللي كاتب مش هو الموظف)
            if (task.AssignedMemberId.HasValue && userId != task.AssignedMemberId)
            {
                await _notificationService.SendTaskNotification(
                    task.AssignedMemberId.Value.ToString(),
                    $"{user.FullName} commented on your task: {content}",
                    taskId
                );
            }

            // 2. إرسال للمدير (لو اللي كاتب مش هو المدير)
            var projectManagerId = await _context.Projects
                .Where(p => p.Id == task.ProjectId)
                .Select(p => p.ProjectManagerId)
                .FirstOrDefaultAsync();

            if (projectManagerId > 0 && userId != projectManagerId)
            {
                await _notificationService.SendTaskNotification(
                    projectManagerId.ToString(),
                    $"{user.FullName} commented on task '{task.Title}'",
                    taskId
                );
            }
        }

        return comment;
    }

        public async Task<bool> DeleteComment(int commentId, int userId)
        {
            var comment = await _commentRepo.GetByIdAsync(commentId);
            var user = await _context.Users.FindAsync(userId);

            if (comment == null || user == null)
                return false;

            bool isOwner = comment.UserId == userId;
            bool isAdminOrPM = user.Role == Role.Admin || user.Role == Role.ProjectManager;

            if (!isOwner && !isAdminOrPM)
                return false;

            _commentRepo.Remove(comment);
            await _commentRepo.SaveChangesAsync();

            return true;
        }
    }
}

