namespace TaskFlow.DTOs
{
    public class CreateTaskDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int AssignedMemberId { get; set; }
        public int ProjectId { get; set; }
        public string Priority { get; set; }
        public DateTime DueDate { get; set; }
    }
}