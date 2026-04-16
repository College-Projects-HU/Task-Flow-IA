namespace TaskFlow.Models
{
    public enum Role
    {
        Admin,
        ProjectManager,
        Member
    }

    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public Role Role { get; set; }
        public bool IsApproved { get; set; }
        public DateTime CreatedAt { get; set; }

        // العلاقات
        public ICollection<Comment> Comments { get; set; }
        public ICollection<Notification> Notifications { get; set; }
        public ICollection<TaskItem> AssignedTasks { get; set; }
        public ICollection<Project> ManagedProjects { get; set; }
    }
}
