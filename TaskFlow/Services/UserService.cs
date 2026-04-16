using TaskFlow.Data;
using TaskFlow.Models;

namespace TaskFlow.Services
{
    public class UserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User> CreateUser(User user)
        {
            user.CreatedAt = DateTime.UtcNow;
            user.IsApproved = true;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }
    }
}