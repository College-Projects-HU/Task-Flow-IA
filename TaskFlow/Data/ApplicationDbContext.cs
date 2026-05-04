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
            modelBuilder.Entity<User>()
                .Property(u => u.CanInteractWithTasks)
                .HasDefaultValue(true);

            modelBuilder.Entity<User>()
                .Property(u => u.CanComment)
                .HasDefaultValue(true);

            modelBuilder.Entity<User>()
                .Property(u => u.CanAttachFiles)
                .HasDefaultValue(true);

            base.OnModelCreating(modelBuilder);
        }
    }
}