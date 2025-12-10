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

// Convert PostgreSQL URI format to standard connection string if needed
// Railway format: postgresql://user:pass@host:port/db
// Npgsql supports URI format directly, but we'll convert for better compatibility
if (connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) || 
    connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
{
    try
    {
        // Use UriBuilder for more robust parsing, or parse manually
        var uriString = connectionString.Trim();
        
        // Try using Uri class first
        var uri = new Uri(uriString);
        
        // Extract components
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432; // Default PostgreSQL port
        var database = uri.AbsolutePath.TrimStart('/');
        
        // Parse user info (username:password)
        string username = "postgres";
        string password = "";
        if (!string.IsNullOrEmpty(uri.UserInfo))
        {
            var userInfoParts = uri.UserInfo.Split(':', 2);
            if (userInfoParts.Length > 0)
            {
                username = Uri.UnescapeDataString(userInfoParts[0]);
            }
            if (userInfoParts.Length > 1)
            {
                password = Uri.UnescapeDataString(userInfoParts[1]);
            }
        }
        
        // Build standard connection string
        var connBuilder = new System.Text.StringBuilder();
        connBuilder.Append($"Host={host};");
        connBuilder.Append($"Port={port};");
        connBuilder.Append($"Database={database};");
        connBuilder.Append($"Username={username};");
        if (!string.IsNullOrEmpty(password))
        {
            connBuilder.Append($"Password={password};");
        }
        connBuilder.Append("SSL Mode=Require;");
        connectionString = connBuilder.ToString();
        Console.WriteLine("[DB Config] Converted PostgreSQL URI to standard format");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB Config] Warning: Could not parse URI format: {ex.Message}");
        Console.WriteLine($"[DB Config] Using original URI format - Npgsql should handle it");
        // Continue with original format - Npgsql supports URI format directly
        // Just ensure it's trimmed
        connectionString = connectionString.Trim();
    }
}

// Log connection string type (without sensitive data)
var dbType = connectionString.ToLowerInvariant().Contains("postgres") || connectionString.Contains("Host=") ? "PostgreSQL" 
    : connectionString.Contains(".db") ? "SQLite" 
    : "SQL Server";
Console.WriteLine($"[DB Config] Using {dbType} database");
Console.WriteLine($"[DB Config] Connection string length: {connectionString.Length}");

// Detect database type from connection string
var lowerConnection = connectionString.ToLowerInvariant();
if (lowerConnection.Contains("postgresql://") || 
    lowerConnection.Contains("postgres://") ||
    lowerConnection.Contains("postgresql") || 
    lowerConnection.Contains("postgres") ||
    (connectionString.Contains("Host=") && connectionString.Contains("Port=") && !connectionString.Contains("1433")))
{
    // Use Npgsql with the connection string
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
        
        // Use SetIsOriginAllowed to allow Vercel preview domains and custom domains
        policy.SetIsOriginAllowed(origin =>
        {
            // Allow exact matches from config
            if (allowedOrigins.Contains(origin))
                return true;
            
            // Allow all Vercel preview domains (*.vercel.app)
            if (origin.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase))
                return true;
            
            // Allow custom domain variations (runtribes.site, runtribes.app, etc.)
            if (origin.Contains("runtribes.site", StringComparison.OrdinalIgnoreCase) ||
                origin.Contains("runtribes.app", StringComparison.OrdinalIgnoreCase))
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

// Ensure database is migrated (with error handling for manually created columns)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        // Check if PasswordHash column exists and has correct properties
        try
        {
            var connection = dbContext.Database.GetDbConnection();
            await connection.OpenAsync();
            
            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'Users' AND column_name = 'PasswordHash';
            ";
            
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var dataType = reader.GetString(1);
                var maxLength = reader.IsDBNull(2) ? (int?)null : reader.GetInt32(2);
                var isNullable = reader.GetString(3).ToUpper() == "YES";
                var defaultValue = reader.IsDBNull(4) ? null : reader.GetString(4);
                
                Console.WriteLine($"[DB Check] PasswordHash column exists: type={dataType}, maxLength={maxLength}, nullable={isNullable}, default={defaultValue}");
                
                // If column exists but is nullable or wrong type, try to fix it
                if (isNullable || dataType.ToLower() != "character varying" || maxLength != 255)
                {
                    Console.WriteLine("[DB Check] PasswordHash column needs to be fixed. Attempting to alter...");
                    await reader.CloseAsync();
                    
                    // Alter column to match expected schema
                    using var alterCommand = connection.CreateCommand();
                    alterCommand.CommandText = @"
                        ALTER TABLE ""Users""
                        ALTER COLUMN ""PasswordHash"" TYPE character varying(255),
                        ALTER COLUMN ""PasswordHash"" SET NOT NULL,
                        ALTER COLUMN ""PasswordHash"" SET DEFAULT '';
                    ";
                    
                    try
                    {
                        await alterCommand.ExecuteNonQueryAsync();
                        Console.WriteLine("[DB Check] PasswordHash column fixed successfully");
                    }
                    catch (Exception alterEx)
                    {
                        Console.WriteLine($"[DB Check] Warning: Could not auto-fix PasswordHash column: {alterEx.Message}");
                        Console.WriteLine("[DB Check] You may need to manually fix the column or drop and recreate it");
                    }
                }
            }
            else
            {
                Console.WriteLine("[DB Check] PasswordHash column does not exist. Migrations should create it.");
            }
            
            await connection.CloseAsync();
        }
        catch (Exception checkEx)
        {
            // If it's not PostgreSQL, skip the check (SQLite doesn't have information_schema the same way)
            var providerName = dbContext.Database.ProviderName ?? "";
            if (!providerName.Contains("PostgreSQL") && !providerName.Contains("Npgsql"))
            {
                Console.WriteLine("[DB Check] Skipping column check for non-PostgreSQL database");
            }
            else
            {
                Console.WriteLine($"[DB Check] Could not check PasswordHash column: {checkEx.Message}");
            }
        }
        
        // Try to apply pending migrations
        await dbContext.Database.MigrateAsync();
        Console.WriteLine("[DB] Database migrations applied successfully");
    }
}
catch (Exception migrationEx)
{
    Console.WriteLine($"[DB] Warning: Could not apply migrations automatically: {migrationEx.Message}");
    if (migrationEx.InnerException != null)
    {
        Console.WriteLine($"[DB] Inner exception: {migrationEx.InnerException.Message}");
    }
    // Don't fail startup - let the app run and show better errors
}

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
