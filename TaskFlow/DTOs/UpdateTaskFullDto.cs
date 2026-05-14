namespace TaskFlow.DTOs
{
    public class UpdateTaskFullDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium"; 
        public TaskFlow.Models.TaskStatus Status { get; set; }
        public DateTime DueDate { get; set; }
        public int? AssignedMemberId { get; set; } // 👈 التأكد من الاسم ده
    }
}