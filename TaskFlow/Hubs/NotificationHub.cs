using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TaskFlow.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
    }
}
