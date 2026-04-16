using Microsoft.AspNetCore.Mvc;
using TaskFlow.DTOs;
using TaskFlow.Models;
using TaskFlow.Services;

namespace TaskFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(UserCreateDto dto)
        {
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = dto.PasswordHash,
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow,
                IsApproved = true
            };

            var result = await _userService.CreateUser(user);
            return Ok(result);
        }
    }
}