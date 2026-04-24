using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.DTOs;
using TaskFlow.Models;
using TaskFlow.Services;

namespace TaskFlow.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly ProjectService _service;

        public ProjectsController(ProjectService service)
        {
            _service = service;
        }
        [HttpGet("{id}/stats")]
        public async Task<IActionResult> GetStats(int id)
        {
            var stats = await _service.GetProjectStats(id);
            return Ok(stats);
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            var projects = _service.GetAll(userId, role);

            var result = projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name ?? string.Empty,
                Description = p.Description ?? string.Empty,
                Tasks = p.Tasks.Select(t => t.Title).ToList()
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            var project = _service.GetById(id, userId, role);

            if (project == null)
                return NotFound();

            var dto = new ProjectDto
            {
                Id = project.Id,
                Name = project.Name ?? string.Empty,
                Description = project.Description ?? string.Empty,
                Tasks = project.Tasks.Select(t => t.Title).ToList()
            };

            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = "ProjectManager")]
        public IActionResult Create(CreateProjectDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description ?? string.Empty,
                ProjectManagerId = userId
            };

            _service.Create(project);

            return Ok(project);
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "ProjectManager")]
        public IActionResult Update(int id, CreateProjectDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            var project = _service.GetById(id, userId, role);

            if (project == null)
                return NotFound();

            project.Name = dto.Name;
            project.Description = dto.Description ?? string.Empty;

            _service.Update(project);

            return Ok(project);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ProjectManager")]
        public IActionResult Delete(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            var project = _service.GetById(id, userId, role);

            if (project == null)
                return NotFound();

            _service.Delete(project);

            return Ok("Deleted");
        }
    }

}
