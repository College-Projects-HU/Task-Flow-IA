using System.Text.Json.Serialization;

namespace TaskFlow.DTOs
{
    public class UpdateTaskStatusDto
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TaskFlow.Models.TaskStatus Status { get; set; }
    }
}
