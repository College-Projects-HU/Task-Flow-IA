using Microsoft.AspNetCore.Mvc;
using TaskFlow.DTOs;
using TaskFlow.Interfaces;

namespace TaskFlow.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var (success, message, userId) = await _authService.RegisterAsync(dto);
            if (!success) return BadRequest(new { message });
            return Ok(new { message, userId });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var (success, result) = await _authService.LoginAsync(dto);
            if (!success) return BadRequest(new { message = result });
            return Ok(new { token = result, message = "Login successful!" });
        }
    }
}