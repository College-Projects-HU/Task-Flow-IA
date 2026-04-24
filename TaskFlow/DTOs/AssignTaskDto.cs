using System.ComponentModel.DataAnnotations;

namespace TaskFlow.DTOs
{
    public class AssignTaskDto
    {
        [Required]
        public int UserId { get; set; }
    }
}
