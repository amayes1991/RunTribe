using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using Microsoft.Extensions.FileProviders;
using System.Linq;
using System.Collections.Generic;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add SignalR
builder.Services.AddSignalR();

// Add Entity Framework and Database
// Railway provides DATABASE_PUBLIC_URL for PostgreSQL, .NET expects ConnectionStrings:DefaultConnection
// Check multiple environment variable formats
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// Check if connection string is empty or null, then try environment variables
if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
        ?? Environment.GetEnvironmentVariable("DATABASE_PUBLIC_URL");
}

// Log for debugging (remove sensitive info)
if (string.IsNullOrWhiteSpace(connectionString))
{
    var env = builder.Environment.EnvironmentName;
    var hasDbUrl = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DATABASE_URL"));
    var hasDbPublicUrl = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DATABASE_PUBLIC_URL"));
    var configConn = builder.Configuration.GetConnectionString("DefaultConnection");
    
    Console.WriteLine($"[DB Config] Environment: {env}");
    Console.WriteLine($"[DB Config] DATABASE_URL exists: {hasDbUrl}");
    Console.WriteLine($"[DB Config] DATABASE_PUBLIC_URL exists: {hasDbPublicUrl}");
    Console.WriteLine($"[DB Config] Config DefaultConnection: {(string.IsNullOrWhiteSpace(configConn) ? "empty" : "set")}");
    
    throw new InvalidOperationException(
        $"Connection string not found in {env} environment. " +
        $"DATABASE_URL: {(hasDbUrl ? "set" : "not set")}, " +
        $"DATABASE_PUBLIC_URL: {(hasDbPublicUrl ? "set" : "not set")}, " +
        $"Config DefaultConnection: {(string.IsNullOrWhiteSpace(configConn) ? "empty" : "set")}. " +
        "Please set DATABASE_URL or DATABASE_PUBLIC_URL in Railway Variables.");
}

// Clean and validate connection string
connectionString = connectionString.Trim();
// Remove any newlines or extra whitespace that might cause parsing issues
connectionString = string.Join("", connectionString.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries));

// Log connection string type (without sensitive data)
var dbType = connectionString.ToLowerInvariant().Contains("postgres") ? "PostgreSQL" 
    : connectionString.Contains(".db") ? "SQLite" 
    : "SQL Server";
Console.WriteLine($"[DB Config] Using {dbType} database");
Console.WriteLine($"[DB Config] Connection string length: {connectionString.Length}");

// Detect database type from connection string
// Railway PostgreSQL format: postgresql://user:pass@host:port/db
// Standard PostgreSQL format: Host=...;Port=...;Database=...
var lowerConnection = connectionString.ToLowerInvariant();
if (lowerConnection.Contains("postgresql://") || 
    lowerConnection.Contains("postgres://") ||
    lowerConnection.Contains("postgresql") || 
    lowerConnection.Contains("postgres") ||
    (connectionString.Contains("Host=") && connectionString.Contains("Port=") && !connectionString.Contains("1433")))
{
    // Npgsql supports URI format directly, but ensure it's clean
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString, npgsqlOptions => 
            npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3)));
}
else if (connectionString.Contains(".db") || connectionString.Contains("Data Source"))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(connectionString));
}
else
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
}



// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
    
    // Production CORS policy
    options.AddPolicy("Production", policy =>
    {
        // Read from array in appsettings or comma-separated string from environment variable
        var corsSection = builder.Configuration.GetSection("Cors:AllowedOrigins");
        string[] allowedOrigins;
        
        if (corsSection.Exists() && corsSection.GetChildren().Any())
        {
            // Read from JSON array
            allowedOrigins = corsSection.Get<string[]>() ?? new[] { "http://localhost:3000" };
        }
        else
        {
            // Read from comma-separated string (environment variable)
            var corsString = builder.Configuration["Cors:AllowedOrigins"];
            allowedOrigins = !string.IsNullOrEmpty(corsString) 
                ? corsString.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                : new[] { "http://localhost:3000" };
        }
        
        // Add Vercel preview domains dynamically (all *.vercel.app domains)
        var vercelOrigins = new List<string>(allowedOrigins);
        vercelOrigins.Add("https://*.vercel.app");
        vercelOrigins.Add("http://*.vercel.app");
        
        // Use SetIsOriginAllowed to allow Vercel preview domains
        policy.SetIsOriginAllowed(origin =>
        {
            // Allow exact matches from config
            if (allowedOrigins.Contains(origin))
                return true;
            
            // Allow all Vercel preview domains (*.vercel.app)
            if (origin.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase))
                return true;
            
            // Allow localhost for development
            if (origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase))
                return true;
            
            return false;
        })
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Only use HTTPS redirection in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Use appropriate CORS policy based on environment
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
}
else
{
    app.UseCors("Production");
}

// Serve static files from wwwroot
app.UseStaticFiles();

// Serve static files from uploads directory
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
// Create uploads directory and subdirectories if they don't exist
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
// Create subdirectories for organized file storage
var groupsUploadPath = Path.Combine(uploadsPath, "groups");
var shoesUploadPath = Path.Combine(uploadsPath, "shoes");
if (!Directory.Exists(groupsUploadPath))
{
    Directory.CreateDirectory(groupsUploadPath);
}
if (!Directory.Exists(shoesUploadPath))
{
    Directory.CreateDirectory(shoesUploadPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub
app.MapHub<RunTribe.Api.Hubs.ChatHub>("/chathub");

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
