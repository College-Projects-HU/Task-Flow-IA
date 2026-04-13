namespace TaskFlow.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public int UserId { get; set; }
        public int TaskId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
