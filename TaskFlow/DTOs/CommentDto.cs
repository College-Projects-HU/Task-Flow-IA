namespace TaskFlow.DTOs
{
    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string AuthorName { get; set; }
        public int AuthorId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
