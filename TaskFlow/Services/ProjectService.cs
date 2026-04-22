using Microsoft.EntityFrameworkCore;
using System;
using TaskFlow.Data;
using TaskFlow.DTOs;
using TaskFlow.Models;

namespace TaskFlow.Services
{
    public class ProjectService
    {
        private readonly ApplicationDbContext _context;

        public ProjectService(ApplicationDbContext context)
        {
            _context = context;
        }

        public List<Project> GetAll()
        {
            return _context.Projects
                .Include(p => p.Tasks) 
                .Where(p => !p.IsDeleted)
                .ToList();
        }

        public Project GetById(int id)
        {
            return _context.Projects
                .Include(p => p.Tasks) 
                .FirstOrDefault(p => p.Id == id && !p.IsDeleted);
        }

        public Project Create(Project project)
        {
            _context.Projects.Add(project);
            _context.SaveChanges();
            return project;
        }

        public void Update(Project project)
        {
            _context.SaveChanges();
        }

        public void Delete(Project project)
        {
            project.IsDeleted = true;
            _context.SaveChanges();
        }
        public async Task<StatsDto> GetProjectStats(int projectId)
        {
            var tasks = await _context.Tasks
                .Include(t => t.AssignedMember)
                .Where(t => t.ProjectId == projectId)
                .ToListAsync();

            var stats = new StatsDto
            {
                TotalTasks = tasks.Count,

                CompletedTasks = tasks.Count(t => t.Status == TaskFlow.Models.TaskStatus.Done),

                InProgressTasks = tasks.Count(t => t.Status == TaskFlow.Models.TaskStatus.InProgress),


                PerMember = tasks
                    .Where(t => t.Status == TaskFlow.Models.TaskStatus.Done && t.AssignedMember != null)
                    .GroupBy(t => t.AssignedMember.FullName)
                    .Select(g => new MemberStatsDto
                    {
                        MemberName = g.Key,
                        CompletedTasks = g.Count()
                    })
                    .ToList()
            };

            return stats;
        }

    }

}
