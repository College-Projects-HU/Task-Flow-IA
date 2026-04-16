using Microsoft.AspNetCore.Mvc;
using TaskFlow.DTOs;
using TaskFlow.Models;
using TaskFlow.Services;

namespace TaskFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly ProjectService _projectService;

        public ProjectsController(ProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet("{id}/members")]
        public async Task<IActionResult> GetProjectMembers(int id)
        {
            var project = await _projectService.GetProjectById(id);

            if (project == null)
                return NotFound("Project not found");

            var members = project.Members.Select(m => new
            {
                m.Id,
                m.FullName,
                m.Email
            });

            return Ok(members);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ProjectCreateDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                ProjectManagerId = dto.ProjectManagerId
            };

            var result = await _projectService.CreateProject(project);
            return Ok(result);
        }
    }
}