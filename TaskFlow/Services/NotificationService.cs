using Microsoft.AspNetCore.SignalR;
using TaskFlow.Data;
using TaskFlow.Hubs;
using TaskFlow.Interfaces;
using TaskFlow.Models;

namespace TaskFlow.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ApplicationDbContext _context;

        public NotificationService(IHubContext<NotificationHub> hubContext, ApplicationDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        public async Task SendTaskNotification(string userId, string message, int taskId)
        {
            // 1. حفظ الإشعار في الداتابيز
            var notification = new Notification
            {
                UserId = int.Parse(userId), // تأكدي من نوع الـ ID عندك
                Message = message,
                TaskId = taskId,
                IsRead = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // 2. إرسال الإشعار للـ Hub عشان يوصل لليوزر (Real-time)
            var connectionId = NotificationHub.GetConnectionId(userId);

            if (connectionId != null)
            {
                await _hubContext.Clients.Client(connectionId).SendAsync("NewNotification", notification);
            }
        }
    }
}