using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.DTOs;
using TaskFlow.Services;

namespace TaskFlow.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly CommentService _commentService;

        public CommentsController(CommentService commentService)
        {
            _commentService = commentService;
        }

        // GET /api/tasks/{id}/comments
        [HttpGet("tasks/{id}/comments")]
        public async Task<IActionResult> GetComments(int id)
        {
            var comments = await _commentService.GetCommentsByTask(id);

            var result = comments.Select(c => new CommentDto
            {
                Id = c.Id,
                Content = c.Content,
                AuthorName = c.User.FullName,
                AuthorId = c.UserId,
                CreatedAt = c.CreatedAt
            });

            return Ok(result);
        }

        // POST /api/tasks/{id}/comments
        [Authorize]
        [HttpPost("tasks/{id}/comments")]
        public async Task<IActionResult> AddComment(int id, CreateCommentDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var comment = await _commentService.AddComment(id, userId, dto.Content);

            return Ok(comment);
        }

        // DELETE /api/comments/{id}
        [Authorize]
        [HttpDelete("comments/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var success = await _commentService.DeleteComment(id, userId);

            if (!success)
                return Forbid();

            return Ok();
        }
    }
}
