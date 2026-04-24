using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TaskStatusModel = TaskFlow.Models.TaskStatus;

namespace TaskFlow.DTOs
{
    public class TaskUpdateRequestDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        public int? AssignedUserId { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TaskPriority? Priority { get; set; }

        public DateTime? DueDate { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TaskStatusModel? Status { get; set; }
    }
}
