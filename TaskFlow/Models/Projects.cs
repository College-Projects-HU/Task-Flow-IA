namespace TaskFlow.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int ProjectManagerId { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<TaskItem> Tasks { get; set; }
    }
}
