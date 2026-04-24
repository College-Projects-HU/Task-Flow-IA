namespace TaskFlow.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string Message { get; set; }
        public int UserId { get; set; }
        public bool IsRead { get; set; } = false; //  عشان تكون أسهل في التعامل

      
        public int TaskId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}