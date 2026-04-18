using Microsoft.EntityFrameworkCore;
using TaskFlow.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaskFlow.Interfaces;
using TaskFlow.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. ربط قاعدة البيانات (SQLite)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. إعدادات الـ JWT (شغل دعاء M3)
// تأكدي أن "Key" في appsettings.json لا يقل عن 32 حرف
var jwtKey = builder.Configuration["Jwt:Key"];
var keyBytes = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
    };
});

// 3. إعداد الـ CORS عشان الفرونت اند (React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // تأكدي من بورت الـ Vite بتاعك
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 4. تسجيل الخدمات (Dependency Injection)
builder.Services.AddScoped<ProjectService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Paste your raw JWT token"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

// إعدادات الـ Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// الترتيب هنا "حياة أو موت" للمشروع:
app.UseCors("ReactPolicy");

app.UseAuthentication(); // 1. التحقق من الهوية (مين اليوزر؟)
app.UseAuthorization();  // 2. التحقق من الصلاحيات (مسموح له يعمل إيه؟)

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    // Ensure the database is created
    context.Database.EnsureCreated();

    // Check if the admin user exists
    if (!context.Users.Any(u => u.Email == "admin@a.a"))
    {
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
        await authService.RegisterAsync(new TaskFlow.DTOs.RegisterDto
        {
            Email = "admin@a.a",
            Password = "admin123",
            FullName = "Administrator",
            Role = TaskFlow.Models.Role.Admin
        });

        // By default, RegisterAsync sets IsApproved = false for Admin, so we approve them
        var adminUser = context.Users.FirstOrDefault(u => u.Email == "admin@a.a");
        if (adminUser != null)
        {
            adminUser.IsApproved = true;
            await context.SaveChangesAsync();
        }
    }
}

app.Run();