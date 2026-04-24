using System.Text.Json.Serialization;
using TaskStatusModel = TaskFlow.Models.TaskStatus;

namespace TaskFlow.DTOs
{
    public class TaskResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? AssignedUserId { get; set; }
        public string AssignedUserName { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TaskPriority Priority { get; set; }
        public DateTime DueDate { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TaskStatusModel Status { get; set; }
        public List<TaskCommentResponseDto> Comments { get; set; } = new();
        public List<TaskAttachmentResponseDto> Attachments { get; set; } = new();
    }
}
