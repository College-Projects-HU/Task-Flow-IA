using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace TaskFlow.Hubs
{
    public class NotificationHub : Hub
    {
        // بنستخدم ConcurrentDictionary عشان نحفظ الـ Connections بأمان 
        // لأن كذا مستخدم ممكن يفتحوا الإشعارات في نفس الوقت
        private static readonly ConcurrentDictionary<string, string> _userConnections = new();

        public override async Task OnConnectedAsync()
        {
            // بنجيب الـ UserId من الـ Token (Claim) بتاع المستخدم
            var userId = Context.UserIdentifier;

            if (!string.IsNullOrEmpty(userId))
            {
                _userConnections[userId] = Context.ConnectionId;
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // لما المستخدم يقفل الـ App، بنشيل الـ Connection بتاعه
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                _userConnections.TryRemove(userId, out _);
            }
            await base.OnDisconnectedAsync(exception);
        }

        // دي ميثود هنستخدمها لما نحب نعرف السيرفر "مين هو الـ ConnectionId" الخاص بمستخدم معين
        public static string? GetConnectionId(string userId)
        {
            return _userConnections.TryGetValue(userId, out var connectionId) ? connectionId : null;
        }
    }
}