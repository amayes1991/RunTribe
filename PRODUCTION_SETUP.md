# 🚀 Production Database Setup Guide

## Overview
This guide explains how to set up your database for production on Railway (backend) and Vercel (frontend).

## Database Strategy

- **Local Development**: SQLite (file-based, no setup needed)
- **Production**: PostgreSQL (managed database on Railway)

## Step 1: Set Up PostgreSQL on Railway

### 1.1 Add PostgreSQL Database Service

1. Go to your Railway project dashboard
2. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically:
   - Create a PostgreSQL database
   - Generate connection credentials
   - Provide a `DATABASE_PUBLIC_URL` environment variable

### 1.2 Railway Auto-Configuration

Railway automatically provides these environment variables for the PostgreSQL service:
- `DATABASE_PUBLIC_URL` - Full PostgreSQL connection string in URI format (`postgresql://user:pass@host:port/db`)
- `PGHOST` - Database host
- `PGPORT` - Database port
- `PGUSER` - Database user
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

**Important**: 
- Railway provides `DATABASE_PUBLIC_URL` (not `DATABASE_URL`)
- You need to manually set `DATABASE_URL` in your API service to point to this value
- The connection string is already in the correct PostgreSQL format

### 1.3 Configure Your API Service Environment Variables

**IMPORTANT**: You must set these environment variables in Railway for migrations and the application to work correctly.

1. Go to Railway Dashboard → Your Project → **`runners-app`** service
2. Click on **"Variables"** tab
3. Add the following environment variables:

   **Required Variables:**
   ```
   ASPNETCORE_ENVIRONMENT=Production
   DATABASE_URL=<copy value from DATABASE_PUBLIC_URL>
   ```

   **How to get DATABASE_URL:**
   - In the same Variables tab, find `DATABASE_PUBLIC_URL`
   - Copy its entire value (it looks like: `postgresql://postgres:password@host:port/database`)
   - Create a new variable `DATABASE_URL` and paste the value

   **Note**: Railway automatically provides `DATABASE_PUBLIC_URL` from the PostgreSQL service. The application code will check for both `DATABASE_URL` and `DATABASE_PUBLIC_URL`, but setting `DATABASE_URL` ensures Entity Framework migrations work correctly.

## Step 2: Run Database Migrations

After deploying your API, run migrations to create the database schema:

### Option 1: Using Railway CLI

**Prerequisites**: Make sure you've set the environment variables in Railway Dashboard (see Step 1.3 above).

```bash
# Install Railway CLI if needed
curl -fsSL https://railway.app/install.sh | sh

# Login to Railway
railway login

# Link to your project (select your API service, not Postgres)
cd RunTribe.Api
railway link
# Select: runners-app (your API service)

# Run migrations
railway run dotnet ef database update
```

**Important**: 
- Make sure `ASPNETCORE_ENVIRONMENT=Production` and `DATABASE_URL` are set in Railway Variables
- The migration will use the PostgreSQL database from `DATABASE_URL`
- If you see SQLite errors, verify the environment variables are set correctly

### Option 2: Using Railway Dashboard (⭐ RECOMMENDED)

**This is the most reliable method** - it ensures all environment variables are properly loaded and the connection string is correctly formatted.

1. Go to Railway Dashboard → Your Project → **`runners-app`** service
2. Click on **"Deployments"** tab
3. Click **"New Deployment"** → **"Run Command"**
4. Enter: `dotnet ef database update`
5. Click **"Deploy"**

**Why this works better:**
- All environment variables are automatically available
- Connection strings are properly formatted
- No need to manually set variables in CLI
- Most reliable for first-time setup

**If you see connection errors with CLI**, use this method instead.

### Option 3: Using Railway Shell

1. Go to Railway Dashboard → Your Project → **`runners-app`** service
2. Click on **"Shell"** tab
3. Run: `dotnet ef database update`

**Note**: Make sure environment variables are set before running this command.

## Step 3: Verify Database Connection

### Check API Logs
1. Go to Railway dashboard → Your API service → **"Logs"**
2. Look for successful database connection messages
3. If you see errors, check:
   - `DATABASE_URL` is set correctly
   - PostgreSQL service is running
   - Migrations have been run

### Test API Endpoint
Visit your Railway API URL:
- `https://your-app.railway.app/weatherforecast` - Should return data
- `https://your-app.railway.app/swagger` - Should show API documentation (if enabled)

## Step 4: Configure Frontend (Vercel)

### 4.1 Set Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

```
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=<generate-a-strong-secret-here>
SENDGRID_API_KEY=<your-sendgrid-key>
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-key>
```

### 4.2 Update CORS Settings

In Railway, add this environment variable to your API service:

```
Cors__AllowedOrigins=https://your-vercel-app.vercel.app,https://www.your-vercel-app.vercel.app
```

Or update `appsettings.Production.json` with your Vercel domains.

## Step 5: Deploy

### Deploy Backend to Railway

```bash
cd RunTribe.Api
railway up
```

Or use the deployment script:
```bash
./deploy-api-railway.sh
```

### Deploy Frontend to Vercel

```bash
cd runtribe
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Troubleshooting

### Database Connection Errors

**Error**: "Could not open a connection to SQL Server" or "SQLite Error"
- **Solution**: The application is trying to use the wrong database. Check that:
  1. `ASPNETCORE_ENVIRONMENT=Production` is set in Railway Variables
  2. `DATABASE_URL` is set and contains the PostgreSQL connection string (copy from `DATABASE_PUBLIC_URL`)
  3. PostgreSQL service is running in Railway
  4. You're running migrations in the Railway environment, not locally

**Error**: "Connection refused" or "Database does not exist"
- **Solution**: 
  1. Verify PostgreSQL service is running in Railway
  2. Check `DATABASE_URL` is set correctly (should match `DATABASE_PUBLIC_URL`)
  3. Ensure you're using the production environment variables

**Error**: "Format of the initialization string does not conform to specification"
- **Solution**: 
  1. **Use Railway Dashboard's "Run Command" method** (Option 2) - this is the most reliable
  2. If using CLI, verify `DATABASE_URL` is set correctly in Railway Variables
  3. Make sure you copied the entire connection string from `DATABASE_PUBLIC_URL` (no line breaks)
  4. The design-time factory (`ApplicationDbContextFactory`) should automatically detect PostgreSQL from the URI format

**Note**: If CLI migrations fail, the Railway Dashboard "Run Command" method almost always works because it has proper environment variable handling.

### Migration Errors

**Error**: "No migrations found"
- **Solution**: Make sure you're running migrations from the `RunTribe.Api` directory where migrations are located

**Error**: "Table already exists"
- **Solution**: The database might already have tables. You can:
  1. Drop and recreate: `railway run dotnet ef database drop --force` then `railway run dotnet ef database update`
  2. Or check if migrations are already applied

### CORS Errors

**Error**: "CORS policy blocked"
- **Solution**:
  1. Verify your Vercel domain is in `Cors__AllowedOrigins`
  2. Check that production CORS policy is being used (not development)
  3. Ensure `ASPNETCORE_ENVIRONMENT=Production` is set

## Database Backup & Maintenance

### Railway Automatic Backups

Railway PostgreSQL databases include:
- Automatic daily backups
- Point-in-time recovery
- Backup retention (varies by plan)

### Manual Backup

```bash
# Using Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql

# Or using Railway dashboard
# Go to PostgreSQL service → Backups → Create Backup
```

### Restore Backup

```bash
railway run psql $DATABASE_URL < backup.sql
```

## Environment Summary

### Local Development
- **Database**: SQLite (`RunTribeDb.db`)
- **Connection**: `Data Source=RunTribeDb.db`
- **No setup needed** - just run the app

### Production (Railway)
- **Database**: PostgreSQL (managed by Railway)
- **Connection**: `DATABASE_URL` (set manually from `DATABASE_PUBLIC_URL`)
- **Setup**: Add PostgreSQL service, set environment variables, run migrations

## Quick Reference

```bash
# Local development
cd RunTribe.Api
dotnet run
# Uses SQLite automatically (RunTribeDb.db)

# Production deployment - Step by step
# 1. Set environment variables in Railway Dashboard:
#    - ASPNETCORE_ENVIRONMENT=Production
#    - DATABASE_URL=<copy from DATABASE_PUBLIC_URL>

# 2. Deploy API
cd RunTribe.Api
railway link  # Select: runners-app
railway up

# 3. Run migrations (choose one method)
# Option A: Railway Dashboard → Deployments → Run Command (Recommended)
# Option B: CLI
railway run dotnet ef database update

# Check logs
railway logs

# Access database shell
railway run psql $DATABASE_PUBLIC_URL
```

## Next Steps

1. ✅ Set up PostgreSQL on Railway
2. ✅ Deploy API to Railway
3. ✅ Run database migrations
4. ✅ Configure Vercel environment variables
5. ✅ Deploy frontend to Vercel
6. ✅ Test the full application
7. ✅ Set up monitoring and alerts
8. ✅ Configure database backups

## Support Resources

- [Railway PostgreSQL Docs](https://docs.railway.app/databases/postgresql)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Entity Framework Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)

