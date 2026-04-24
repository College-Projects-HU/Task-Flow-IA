using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }

        // 1. Foreign Key Property
        public int? AssignedMemberId { get; set; } // مهم

        // 2. Navigation Property
        [ForeignKey("AssignedMemberId")]
        public User? AssignedMember { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; }

        public string Priority { get; set; }

        public DateTime DueDate { get; set; }

        public TaskStatus Status { get; set; }
    }
}
