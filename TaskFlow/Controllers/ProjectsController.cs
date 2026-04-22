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
            var projects = _service.GetAll();

            var result = projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Tasks = p.Tasks.Select(t => t.Title).ToList()
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var project = _service.GetById(id);

            if (project == null)
                return NotFound();

            var dto = new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                Tasks = project.Tasks.Select(t => t.Title).ToList()
            };

            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = "ProjectManager")]
        public IActionResult Create(CreateProjectDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                ProjectManagerId = userId
            };

            _service.Create(project);

            return Ok(project);
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "ProjectManager")]
        public IActionResult Update(int id, CreateProjectDto dto)
        {
            var project = _service.GetById(id);

            if (project == null)
                return NotFound();

            project.Name = dto.Name;
            project.Description = dto.Description;

            _service.Update(project);

            return Ok(project);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ProjectManager")]
        public IActionResult Delete(int id)
        {
            var project = _service.GetById(id);

            if (project == null)
                return NotFound();

            _service.Delete(project);

            return Ok("Deleted");
        }
    }

}
