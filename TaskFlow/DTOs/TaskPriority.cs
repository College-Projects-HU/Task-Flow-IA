using System.Text.Json.Serialization;

namespace TaskFlow.DTOs
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TaskPriority
    {
        Low,
        Medium,
        High
    }
}
