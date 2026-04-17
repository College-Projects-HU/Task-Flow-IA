namespace TaskFlow.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int ProjectManagerId { get; set; }
        public bool IsDeleted { get; set; } = false;
        public List<TaskItem> Tasks { get; set; }
    }
}
