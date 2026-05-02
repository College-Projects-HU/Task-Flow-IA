using System.ComponentModel.DataAnnotations;
using TaskFlow.Models;

namespace TaskFlow.DTOs
{
    public class RegisterDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public Role Role { get; set; }

        public Microsoft.AspNetCore.Http.IFormFile? ProfilePicture { get; set; }
    }
}