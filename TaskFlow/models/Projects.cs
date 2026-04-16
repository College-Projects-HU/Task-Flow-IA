namespace TaskFlow.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public int ProjectManagerId { get; set; }
        public User ProjectManager { get; set; }

        public ICollection<TaskItem> Tasks { get; set; }

        // 🔥 نضيفها
        public ICollection<User> Members { get; set; }
    }
}
