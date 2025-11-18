#!/bin/bash

# Database Migration Script for Production
# Run this after deploying to Railway

echo "Starting database migration..."

# Install EF Core tools if not already installed
dotnet tool install --global dotnet-ef

# Add migration for PostgreSQL compatibility
dotnet ef migrations add ProductionPostgreSQL --context ApplicationDbContext

# Update database
dotnet ef database update --context ApplicationDbContext

echo "Database migration completed!"



