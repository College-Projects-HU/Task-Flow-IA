using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using TaskFlow.DTOs;
using TaskFlow.Models;

namespace TaskFlow.Controllers
{
    [Route("api/system-users")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SystemUsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SystemUsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSystemUsers()
        {
            var users = await _context.Users
                .Where(u => u.IsApproved && !u.IsRejected)
                .Select(u => new SystemUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt,
                    IsApproved = u.IsApproved,
                    IsRejected = u.IsRejected,
                    CanInteractWithTasks = u.CanInteractWithTasks,
                    CanComment = u.CanComment,
                    CanAttachFiles = u.CanAttachFiles
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateUserRoleDto dto)
        {
            var loggedInUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(loggedInUserIdStr, out int loggedInUserId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            if (id == loggedInUserId)
            {
                return BadRequest(new { message = "You cannot change your own role." });
            }

            var targetUser = await _context.Users.FindAsync(id);
            if (targetUser == null)
            {
                return NotFound(new { message = "User not found." });
            }

            targetUser.Role = dto.Role;
            
            if (dto.Role == Role.ProjectManager)
            {
                targetUser.IsApproved = false;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Role updated successfully.", isApproved = targetUser.IsApproved });
        }

        [HttpPut("{id}/permissions")]
        public async Task<IActionResult> UpdatePermissions(int id, [FromBody] UpdateUserPermissionsDto dto)
        {
            var loggedInUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(loggedInUserIdStr, out int loggedInUserId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            if (id == loggedInUserId)
            {
                return BadRequest(new { message = "You cannot change your own permissions." });
            }

            var targetUser = await _context.Users.FindAsync(id);
            if (targetUser == null)
            {
                return NotFound(new { message = "User not found." });
            }

            targetUser.CanInteractWithTasks = dto.CanInteractWithTasks;
            targetUser.CanComment = dto.CanComment;
            targetUser.CanAttachFiles = dto.CanAttachFiles;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Permissions updated successfully.",
                canInteractWithTasks = targetUser.CanInteractWithTasks,
                canComment = targetUser.CanComment,
                canAttachFiles = targetUser.CanAttachFiles
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSystemUser(int id)
        {
            var loggedInUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(loggedInUserIdStr, out int loggedInUserId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            if (id == loggedInUserId)
            {
                return BadRequest(new { message = "You cannot delete yourself." });
            }

            var targetUser = await _context.Users.FindAsync(id);
            if (targetUser == null)
            {
                return NotFound(new { message = "User not found." });
            }

            targetUser.IsRejected = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User moved to rejected list." });
        }
    }
}
