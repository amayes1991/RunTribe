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
            // Npgsql supports URI format directly, but let's ensure it's properly formatted
            // Remove any whitespace/newlines
            connectionString = connectionString.Trim();
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

