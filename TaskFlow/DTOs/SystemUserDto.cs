using System;
using TaskFlow.Models;

namespace TaskFlow.DTOs
{
    public class SystemUserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public Role Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsApproved { get; set; }
        public bool IsRejected { get; set; }
    }
}
