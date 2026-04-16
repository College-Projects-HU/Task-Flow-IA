namespace TaskFlow.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string Message { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public bool IsRead { get; set; }
    }
}
