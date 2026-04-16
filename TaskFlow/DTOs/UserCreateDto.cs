using TaskFlow.Models;

namespace TaskFlow.DTOs
{
    public class UserCreateDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public Role Role { get; set; }
    }
}
