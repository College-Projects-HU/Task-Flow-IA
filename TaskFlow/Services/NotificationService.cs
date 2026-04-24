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
            var notification = new Notification
            {
                UserId = int.Parse(userId),
                Message = message,
                TaskId = taskId,
                IsRead = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.User(userId).SendAsync("NewNotification", notification);
        }
    }
}
