using Microsoft.EntityFrameworkCore;
using System;
using TaskFlow.Data;
using TaskFlow.Models;

namespace TaskFlow.Services
{
    public class CommentService
    {
        private readonly ApplicationDbContext _context;

        public CommentService(ApplicationDbContext context)
        {
            _context = context;
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
            if (user == null)
            {
                throw new Exception("User not found");
            }

            if (!user.CanComment)
            {
                throw new UnauthorizedAccessException("You do not have permission to add comments.");
            }

            var comment = new Comment
            {
                TaskId = taskId,
                UserId = userId,
                Content = content
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return comment;
        }

        public async Task<bool> DeleteComment(int commentId, int userId)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            var user = await _context.Users.FindAsync(userId);

            if (comment == null || user == null)
                return false;

            bool isOwner = comment.UserId == userId;
            bool isAdminOrPM = user.Role == Role.Admin || user.Role == Role.ProjectManager;

            if (!isOwner && !isAdminOrPM)
                return false;

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}

