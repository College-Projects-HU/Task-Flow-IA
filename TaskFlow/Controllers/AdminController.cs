using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using TaskFlow.Models;
using System.Linq;
using System.Threading.Tasks;

namespace TaskFlow.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/pending-users
        [HttpGet("pending-users")]
        public async Task<IActionResult> GetPendingUsers()
        {
            var pendingUsers = await _context.Users
                .Where(u => !u.IsApproved && !u.IsRejected && u.Role == Role.ProjectManager)
                .Select(u => new 
                { 
                    u.Id, 
                    u.FullName, 
                    u.Email, 
                    u.CreatedAt 
                })
                .ToListAsync();

            return Ok(pendingUsers);
        }

        // PUT: api/admin/users/{id}/approve
        [HttpPut("users/{id}/approve")]
        public async Task<IActionResult> ApproveUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.Role != Role.ProjectManager)
            {
                return NotFound(new { message = "User not found or is not a project manager." });
            }

            if (user.IsApproved)
            {
                return BadRequest(new { message = "User is already approved." });
            }

            user.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User approved successfully." });
        }

        // PUT: api/admin/users/{id}/reject
        [HttpPut("users/{id}/reject")]
        public async Task<IActionResult> RejectUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.Role != Role.ProjectManager)
            {
                return NotFound(new { message = "User not found or is not a project manager." });
            }

            user.IsApproved = false;
            user.IsRejected = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User rejected successfully." });
        }

        // PUT: api/admin/users/{id}/unreject
        [HttpPut("users/{id}/unreject")]
        public async Task<IActionResult> UnrejectUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (!user.IsRejected)
            {
                return BadRequest(new { message = "User is not rejected." });
            }

            user.IsRejected = false;
            user.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User unrejected successfully." });
        }
    }
}
