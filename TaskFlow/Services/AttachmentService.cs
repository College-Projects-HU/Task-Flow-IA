using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using TaskFlow.Models;
using TaskFlow.DTOs;

namespace TaskFlow.Services
{
    public class AttachmentService
    {
        private readonly ApplicationDbContext _context;

        public AttachmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AttachmentDto> Upload(int taskId, int userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("No file uploaded");

            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null)
                throw new Exception("Task not found");

            // 📁 create folder inside wwwroot
            var folderPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                taskId.ToString()
            );

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            // 📌 unique file name
            var uniqueFileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var fullPath = Path.Combine(folderPath, uniqueFileName);

            // 💾 save file
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 💾 save DB (IMPORTANT FIX)
            var attachment = new Attachment
            {
                TaskId = taskId,
                UploadedByUserId = userId,
                FileName = file.FileName,
                FilePath = $"/uploads/{taskId}/{uniqueFileName}",
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow,
                Task = null // 🔥 مهم لتفادي EF tracking issues
            };

            _context.Attachments.Add(attachment);

            var result = await _context.SaveChangesAsync();

            if (result == 0)
                throw new Exception("File was not saved in DB");

            return new AttachmentDto
            {
                Id = attachment.Id,
                FileName = attachment.FileName,
                FileSize = attachment.FileSize,
                Url = attachment.FilePath
            };
        }

        public async Task<List<AttachmentDto>> GetByTaskId(int taskId)
        {
            return await _context.Attachments
                .Where(a => a.TaskId == taskId)
                .Select(a => new AttachmentDto
                {
                    Id = a.Id,
                    FileName = a.FileName,
                    FileSize = a.FileSize,
                    Url = a.FilePath
                })
                .ToListAsync();
        }
    }
}