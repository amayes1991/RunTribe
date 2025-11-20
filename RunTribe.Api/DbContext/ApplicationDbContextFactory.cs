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

        // Convert PostgreSQL URI format to standard connection string if needed
        if (!string.IsNullOrEmpty(connectionString) && 
            (connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) || 
             connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)))
        {
            // Remove any whitespace/newlines
            connectionString = connectionString.Trim();
            
            // Convert URI format to standard PostgreSQL connection string
            try
            {
                var uri = new Uri(connectionString);
                var builder = new System.Text.StringBuilder();
                builder.Append($"Host={uri.Host};");
                if (uri.Port > 0) builder.Append($"Port={uri.Port};");
                builder.Append($"Database={uri.AbsolutePath.TrimStart('/')};");
                builder.Append($"Username={uri.UserInfo.Split(':')[0]};");
                if (uri.UserInfo.Contains(':'))
                {
                    var password = uri.UserInfo.Split(':', 2)[1];
                    // URL decode the password in case it has special characters
                    password = Uri.UnescapeDataString(password);
                    builder.Append($"Password={password};");
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
        var lowerConnection = connectionString.ToLowerInvariant();
        
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        if (lowerConnection.Contains("postgresql://") || 
            lowerConnection.Contains("postgres://") ||
            lowerConnection.Contains("postgresql") || 
            lowerConnection.Contains("postgres") ||
            (connectionString.Contains("Host=") && connectionString.Contains("Port=") && !connectionString.Contains("1433")))
        {
            // Use Npgsql - it supports both URI and standard format
            optionsBuilder.UseNpgsql(connectionString);
        }
        else if (connectionString.Contains(".db") || connectionString.Contains("Data Source"))
        {
            optionsBuilder.UseSqlite(connectionString);
        }
        else
        {
            optionsBuilder.UseSqlServer(connectionString);
        }

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}

