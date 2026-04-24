using System.ComponentModel.DataAnnotations;

namespace TaskFlow.DTOs
{
    public class CreateCommentDto
    {
        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
    }
}
