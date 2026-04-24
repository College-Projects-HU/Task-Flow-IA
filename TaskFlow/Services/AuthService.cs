using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using TaskFlow.DTOs;
using TaskFlow.Data;
using TaskFlow.Interfaces;
using TaskFlow.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;

namespace TaskFlow.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? string.Empty));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // بنضيف معلومات اليوزر جوه الـ Token (زي الـ ID والـ Role)
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("FullName", user.FullName ?? string.Empty)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1), // الـ Token شغال لمدة يوم
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            // 1. التأكد إن الإيميل مش موجود قبل كده
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return "User already exists!";
            }

            // 2. تشفير الباسورد باستخدام BCrypt
            // الـ HashPassword وظيفتها تحويل الباسورد لنص مشفر مستحيل يرجع لأصله
            string salt = BCrypt.Net.BCrypt.GenerateSalt();
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, salt);

            // 3. إنشاء اليوزر
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = passwordHash,
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow,
                IsApproved = dto.Role == Role.Member ? true : false // الميمبر بياخد اوتو ابروف، المانجر بيحتاج ادمن بعمله ابروف
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return "User registered successfully!";
        }

        
        public async Task<string> LoginAsync(LoginDto dto){
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
                return "Invalid credentials";
                
            try
            {
                if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                    return "Invalid credentials";
            }
            catch (BCrypt.Net.SaltParseException)
            {
                // لو في اي مشكلة بنعرض رسالة صغيرة بدل ما البرنامج كله يضرب في وش اليوزر
                return "Invalid credentials";
            }

            // اتاكد ان البروجكت مانجر معموله ابروف
            if (!user.IsApproved)
            {
                return "Your account is pending admin approval.";
            }


            // لو كل حاجة صح، بنرجع الـ Token
            return GenerateJwtToken(user);
        }
    }
}
