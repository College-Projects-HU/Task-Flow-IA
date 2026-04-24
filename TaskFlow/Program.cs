using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaskFlow.Data;
using TaskFlow.Interfaces;
using TaskFlow.Middlewares;
using TaskFlow.Services;
using TaskFlow.Hubs;

var builder = WebApplication.CreateBuilder(args);

// 1. ربط قاعدة البيانات (SQLite)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. إعدادات الـ JWT (شغل دعاء M3)
// تأكدي أن "Key" في appsettings.json لا يقل عن 32 حرف
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured");
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
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. تسجيل الخدمات (Dependency Injection)
builder.Services.AddScoped<ProjectService>();
builder.Services.AddControllers();
builder.Services.AddScoped<CommentService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<AttachmentService>();
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
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10485760; // 10MB
});
builder.Services.AddSignalR();

// في جزء الـ builder.Services في الـ Program.cs
builder.Services.AddScoped<INotificationService, NotificationService>();

var app = builder.Build();

app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// إعدادات الـ Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// الترتيب هنا "حياة أو موت" للمشروع:
app.UseCors("ReactPolicy");

app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = true
});
app.UseCors("ReactPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    // Ensure the database is created
    context.Database.Migrate();
    // Check if the admin user exists
    if (!context.Users.Any(u => u.Email == "admin@a.a"))
    {
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
        
        // 1. Seed Admin
        await authService.RegisterAsync(new TaskFlow.DTOs.RegisterDto
        {
            Email = "admin@a.a",
            Password = "000000",
            FullName = "Administrator",
            Role = TaskFlow.Models.Role.Admin
        });

        // 2. Seed PM
        await authService.RegisterAsync(new TaskFlow.DTOs.RegisterDto
        {
            Email = "pm@p.p",
            Password = "000000",
            FullName = "Project Manager",
            Role = TaskFlow.Models.Role.ProjectManager
        });

        // 3. Seed Member
        await authService.RegisterAsync(new TaskFlow.DTOs.RegisterDto
        {
            Email = "m@m.m",
            Password = "000000",
            FullName = "Team Member",
            Role = TaskFlow.Models.Role.Member
        });

        // By default, RegisterAsync sets IsApproved = false for Admin and PM, so we approve them
        // Member is auto-approved by default in AuthService, but we can verify it.
        var addedUsers = context.Users.Where(u => u.Email == "admin@a.a" || u.Email == "pm@p.p").ToList();
        foreach(var u in addedUsers)
        {
            u.IsApproved = true;
        }
        await context.SaveChangesAsync();
    }
}

app.Run();