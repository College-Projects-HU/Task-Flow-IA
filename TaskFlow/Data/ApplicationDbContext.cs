using Microsoft.EntityFrameworkCore;
using TaskFlow.Models;

namespace TaskFlow.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    FullName = "Admin",
                    Email = "admin@taskflow.com",
                    PasswordHash = "123456",
                    Role = Role.Admin,
                    IsApproved = true,
                    CreatedAt = new DateTime(2026, 1, 1)
                },
                new User
                {
                    Id = 2,
                    FullName = "Project Manager",
                    Email = "pm@taskflow.com",
                    PasswordHash = "123456",
                    Role = Role.ProjectManager,
                    IsApproved = true,
                    CreatedAt = new DateTime(2026, 1, 1)
                },
                new User
                {
                    Id = 3,
                    FullName = "Team Member",
                    Email = "member@taskflow.com",
                    PasswordHash = "123456",
                    Role = Role.Member,
                    IsApproved = true,
                    CreatedAt = new DateTime(2026, 1, 1)
                }
            );
        }
    }
}