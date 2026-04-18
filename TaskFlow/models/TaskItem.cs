namespace TaskFlow.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }

        public int? AssignedMemberId { get; set; } // مهم

        public int ProjectId { get; set; }
        public Project Project { get; set; }

        public string Priority { get; set; }

        public DateTime DueDate { get; set; }

        public TaskStatus Status { get; set; }
    }
}
