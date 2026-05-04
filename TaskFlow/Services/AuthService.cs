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
        private readonly Microsoft.AspNetCore.Hosting.IWebHostEnvironment _env;

        public AuthService(ApplicationDbContext context, IConfiguration configuration, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env)
        {
            _context = context;
            _configuration = configuration;
            _env = env;
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? string.Empty));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // بنضيف معلومات اليوزر جوه الـ Token (زي الـ ID والـ Role)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("FullName", user.FullName ?? string.Empty),
                new Claim("CanInteractWithTasks", user.CanInteractWithTasks.ToString()),
                new Claim("CanComment", user.CanComment.ToString()),
                new Claim("CanAttachFiles", user.CanAttachFiles.ToString())
            };

            if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
            {
                claims.Add(new Claim("ProfilePictureUrl", user.ProfilePictureUrl));
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1), // الـ Token شغال لمدة يوم
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<(bool Success, string Message, int? UserId)> RegisterAsync(RegisterDto dto)
        {
            // 1. التأكد إن الإيميل مش موجود قبل كده
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return (false, "User already exists!", null);
            }

            // 2. تشفير الباسورد باستخدام BCrypt
            // الـ HashPassword وظيفتها تحويل الباسورد لنص مشفر مستحيل يرجع لأصله
            string salt = BCrypt.Net.BCrypt.GenerateSalt();
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, salt);

            string? profilePictureUrl = null;
            if (dto.ProfilePicture != null)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "profiles");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.ProfilePicture.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ProfilePicture.CopyToAsync(fileStream);
                }

                profilePictureUrl = $"/uploads/profiles/{uniqueFileName}";
            }

            // 3. إنشاء اليوزر
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = passwordHash,
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow,
                IsApproved = (dto.Role == Role.Member || dto.Role == Role.Admin) ? true : false, // الميمبر والأدمن بياخدوا اوتو ابروف، المانجر بيحتاج ادمن بعمله ابروف
                CanInteractWithTasks = true,
                CanComment = true,
                CanAttachFiles = true,
                ProfilePictureUrl = profilePictureUrl
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return (true, "User registered successfully!", user.Id);
        }

        
        public async Task<(bool Success, string TokenOrMessage)> LoginAsync(LoginDto dto){
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
                return (false, "Invalid credentials");
                
            try
            {
                if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                    return (false, "Invalid credentials");
            }
            catch (BCrypt.Net.SaltParseException)
            {
                // لو في اي مشكلة بنعرض رسالة صغيرة بدل ما البرنامج كله يضرب في وش اليوزر
                return (false, "Invalid credentials");
            }

            // اتاكد ان البروجكت مانجر معموله ابروف
            if (user.IsRejected)
            {
                return (false, "Your account has been rejected. You cannot login or register again.");
            }
            if (!user.IsApproved)
            {
                return (false, "Your account is pending admin approval.");
            }


            // لو كل حاجة صح، بنرجع الـ Token
            return (true, GenerateJwtToken(user));
        }
    }
}
