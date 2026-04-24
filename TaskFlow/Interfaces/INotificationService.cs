namespace TaskFlow.Interfaces
{
    public interface INotificationService
    {
        Task SendTaskNotification(string userId, string message, int taskId);
    }
}
