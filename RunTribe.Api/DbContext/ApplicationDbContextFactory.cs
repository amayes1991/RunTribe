using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;

namespace RunTribe.Api.DbContext;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Get connection string from environment variables
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? Environment.GetEnvironmentVariable("DATABASE_PUBLIC_URL")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Data Source=RunTribeDb.db"; // Fallback to SQLite for local development

        // Debug logging
        var hasDbUrl = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DATABASE_URL"));
        var hasDbPublicUrl = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DATABASE_PUBLIC_URL"));
        Console.WriteLine($"[Design-Time DB Config] DATABASE_URL exists: {hasDbUrl}");
        Console.WriteLine($"[Design-Time DB Config] DATABASE_PUBLIC_URL exists: {hasDbPublicUrl}");
        Console.WriteLine($"[Design-Time DB Config] Connection string length: {(connectionString?.Length ?? 0)}");
        if (!string.IsNullOrEmpty(connectionString))
        {
            var preview = connectionString.Length > 20 ? connectionString.Substring(0, 20) : connectionString;
            Console.WriteLine($"[Design-Time DB Config] Connection string starts with: {preview}...");
        }
        else
        {
            Console.WriteLine($"[Design-Time DB Config] Connection string is null or empty");
        }

        // Store original for detection
        var originalConnectionString = connectionString;
        var isPostgresUri = !string.IsNullOrEmpty(connectionString) && 
            (connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) || 
             connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase));

        // Convert PostgreSQL URI format to standard connection string if needed
        if (isPostgresUri && !string.IsNullOrEmpty(connectionString))
        {
            // Remove any whitespace/newlines
            connectionString = connectionString.Trim();
            
            // Convert URI format to standard PostgreSQL connection string
            try
            {
                if (string.IsNullOrEmpty(connectionString)) throw new ArgumentException("Connection string is null or empty");
                
                var uri = new Uri(connectionString);
                var builder = new System.Text.StringBuilder();
                builder.Append($"Host={uri.Host};");
                if (uri.Port > 0) builder.Append($"Port={uri.Port};");
                builder.Append($"Database={uri.AbsolutePath.TrimStart('/')};");
                
                if (!string.IsNullOrEmpty(uri.UserInfo))
                {
                    var userParts = uri.UserInfo.Split(':');
                    if (userParts.Length > 0)
                    {
                        builder.Append($"Username={userParts[0]};");
                        if (userParts.Length > 1)
                        {
                            var password = userParts[1];
                            // URL decode the password in case it has special characters
                            password = Uri.UnescapeDataString(password);
                            builder.Append($"Password={password};");
                        }
                    }
                }
                builder.Append("SSL Mode=Require;");
                connectionString = builder.ToString();
            }
            catch
            {
                // If conversion fails, use original - Npgsql might handle it
            }
        }

        // Detect database type from connection string
        // After conversion, check for standard PostgreSQL format (Host=, Port=) or original URI format
        var lowerConnection = !string.IsNullOrEmpty(connectionString) ? connectionString.ToLowerInvariant() : string.Empty;
        var isPostgres = isPostgresUri || 
            lowerConnection.Contains("postgresql") || 
            lowerConnection.Contains("postgres") ||
            (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("Host=") && connectionString.Contains("Port=") && !connectionString.Contains("1433"));
        
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        if (isPostgres)
        {
            // Use Npgsql - it supports both URI and standard format
            if (string.IsNullOrEmpty(connectionString))
                throw new InvalidOperationException("PostgreSQL connection string is null or empty");
            optionsBuilder.UseNpgsql(connectionString);
        }
        else if (!string.IsNullOrEmpty(connectionString) && (connectionString.Contains(".db") || connectionString.Contains("Data Source")))
        {
            optionsBuilder.UseSqlite(connectionString);
        }
        else
        {
            if (string.IsNullOrEmpty(connectionString))
                throw new InvalidOperationException("Connection string is null or empty");
            optionsBuilder.UseSqlServer(connectionString);
        }

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}

