using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TaskStatusModel = TaskFlow.Models.TaskStatus;

namespace TaskFlow.DTOs
{
    public class TaskCreateRequestDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int? AssignedUserId { get; set; }

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TaskPriority Priority { get; set; }

        public DateTime? DueDate { get; set; }

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TaskStatusModel Status { get; set; }
    }
}
