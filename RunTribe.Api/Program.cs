using Microsoft.EntityFrameworkCore;
using RunTribe.Api.DbContext;
using Microsoft.Extensions.FileProviders;

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
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? Environment.GetEnvironmentVariable("DATABASE_PUBLIC_URL")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection', 'DATABASE_URL', or 'DATABASE_PUBLIC_URL' not found.");

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
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
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
        var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]?.Split(',') ?? new[] { "http://localhost:3000" };
        policy.WithOrigins(allowedOrigins)
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
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
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
