using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
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

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/hubs/notifications"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
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
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<TaskService>();
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
builder.Services.AddSingleton<IUserIdProvider, NameIdentifierUserIdProvider>();

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

    var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

    async Task SeedUserAsync(string email, string password, string fullName, TaskFlow.Models.Role role)
    {
        var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (existingUser != null)
        {
            return;
        }

        await authService.RegisterAsync(new TaskFlow.DTOs.RegisterDto
        {
            Email = email,
            Password = password,
            FullName = fullName,
            Role = role
        });
    }

    await SeedUserAsync("admin1@a.a", "000000", "Administrator 1", TaskFlow.Models.Role.Admin);
    await SeedUserAsync("admin2@a.a", "000000", "Administrator 2", TaskFlow.Models.Role.Admin);
    await SeedUserAsync("admin3@a.a", "000000", "Administrator 3", TaskFlow.Models.Role.Admin);

    await SeedUserAsync("pm1@p.p", "000000", "Project Manager 1", TaskFlow.Models.Role.ProjectManager);
    await SeedUserAsync("pm2@p.p", "000000", "Project Manager 2", TaskFlow.Models.Role.ProjectManager);
    await SeedUserAsync("pm3@p.p", "000000", "Project Manager 3", TaskFlow.Models.Role.ProjectManager);

    await SeedUserAsync("m1@m.m", "000000", "Team Member 1", TaskFlow.Models.Role.Member);
    await SeedUserAsync("m2@m.m", "000000", "Team Member 2", TaskFlow.Models.Role.Member);
    await SeedUserAsync("m3@m.m", "000000", "Team Member 3", TaskFlow.Models.Role.Member);

    var pendingProjectManagers = await context.Users
        .Where(u => u.Role == TaskFlow.Models.Role.ProjectManager && !u.IsApproved)
        .ToListAsync();

    foreach (var user in pendingProjectManagers)
    {
        user.IsApproved = true;
    }

    await context.SaveChangesAsync();
}

app.Run();
