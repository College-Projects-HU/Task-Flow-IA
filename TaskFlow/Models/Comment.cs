using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskFlow.Models;

namespace TaskFlow.Models
{
    public class Comment
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("TaskItem")]
        public int TaskId { get; set; }
        public TaskItem TaskItem { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; }

        [Required]
        public string Content { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
