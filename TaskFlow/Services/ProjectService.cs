using Microsoft.EntityFrameworkCore;
using System;
using TaskFlow.Data;
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
    }

}
