using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using TaskFlow.Models;

namespace TaskFlow.Controllers
{
    [Route("api/profile")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly Microsoft.AspNetCore.Hosting.IWebHostEnvironment _env;

        public ProfileController(ApplicationDbContext context, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                Role = user.Role.ToString(),
                user.CreatedAt,
                user.ProfilePictureUrl
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (!string.IsNullOrWhiteSpace(dto.FullName))
            {
                user.FullName = dto.FullName;
            }

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                // Simple check if email is taken
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != userId))
                {
                    return BadRequest(new { message = "Email is already taken." });
                }
                user.Email = dto.Email;
            }

            if (dto.ProfilePicture != null)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "profiles");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.ProfilePicture.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ProfilePicture.CopyToAsync(fileStream);
                }

                user.ProfilePictureUrl = $"/uploads/profiles/{uniqueFileName}";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully.",
                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    Role = user.Role.ToString(),
                    user.CreatedAt,
                    user.ProfilePictureUrl
                }
            });
        }
    }

    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public Microsoft.AspNetCore.Http.IFormFile? ProfilePicture { get; set; }
    }
}
