using Microsoft.EntityFrameworkCore;
using System;
using TaskFlow.Data;
using TaskFlow.DTOs;
using TaskFlow.Interfaces;
using TaskFlow.Models;

namespace TaskFlow.Services
{
    public class ProjectService
    {
        private readonly ApplicationDbContext _context;
        private readonly IRepository<Project> _projectRepo;

        public ProjectService(ApplicationDbContext context, IRepository<Project> projectRepo)
        {
            _context = context;
            _projectRepo = projectRepo;
        }

        public List<Project> GetAll(int userId, string role)
        {
            var query = _context.Projects
                .Include(p => p.Tasks)
                .Where(p => !p.IsDeleted)
                .AsQueryable();

            if (role == "ProjectManager")
            {
                query = query.Where(p => p.ProjectManagerId == userId);
            }
            else if (role == "Member")
            {
                query = query.Where(p => p.Tasks.Any(t => t.AssignedMemberId == userId));
            }

            return query.ToList();
        }

        public Project GetById(int id, int userId, string role)
        {
            var query = _context.Projects
                .Include(p => p.Tasks)
                .Where(p => p.Id == id && !p.IsDeleted)
                .AsQueryable();

            if (role == "ProjectManager")
            {
                query = query.Where(p => p.ProjectManagerId == userId);
            }
            else if (role == "Member")
            {
                query = query.Where(p => p.Tasks.Any(t => t.AssignedMemberId == userId));
            }

            return query.FirstOrDefault()!;
        }

        public async Task<Project> Create(Project project)
        {
            await _projectRepo.AddAsync(project);
            await _projectRepo.SaveChangesAsync();
            return project;
        }

        public async Task Update(Project project)
        {
            await _projectRepo.SaveChangesAsync();
        }

        public async Task Delete(Project project)
        {
            var attachmentPaths = await _context.Attachments
                .Where(a => _context.Tasks.Any(t => t.Id == a.TaskId && t.ProjectId == project.Id))
                .Select(a => a.FilePath)
                .ToListAsync();

            foreach (var attachmentPath in attachmentPaths)
            {
                var fullPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    attachmentPath.TrimStart('/'));

                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }

            _projectRepo.Remove(project);
            await _projectRepo.SaveChangesAsync();
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
