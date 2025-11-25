# Automatic Database Migrations on Railway

This project is configured to automatically run database migrations before each deployment on Railway.

## How It Works

### Method 1: Railway.json (Primary - Currently Active)

The `railway.json` file includes a `releaseCommand` that runs migrations during the release phase:

```json
{
  "deploy": {
    "releaseCommand": "dotnet ef database update",
    "startCommand": "dotnet RunTribe.Api.dll"
  }
}
```

**How it works:**
- Railway runs `dotnet ef database update` during the release phase
- If migrations succeed, Railway then starts the app with `dotnet RunTribe.Api.dll`
- If migrations fail, the deployment is aborted and the app doesn't start

### Method 2: Procfile (Alternative)

A `Procfile` is also provided as an alternative:

```
release: dotnet ef database update
web: dotnet RunTribe.Api.dll
```

**Note:** Railway will use `railway.json` if present, otherwise it will check for a `Procfile`.

## Requirements

For migrations to work automatically, ensure:

1. **Environment Variables are Set:**
   - `DATABASE_URL` or `DATABASE_PUBLIC_URL` must be set in Railway Variables
   - `ASPNETCORE_ENVIRONMENT=Production` should be set

2. **EF Core Tools Available:**
   - The `Microsoft.EntityFrameworkCore.Tools` package is already included in the project
   - Railway's build process will make `dotnet ef` available

3. **PostgreSQL Connection:**
   - The Postgres service must be linked to your API service
   - Railway automatically provides `DATABASE_PUBLIC_URL` when services are linked

## Verification

After deployment, check Railway logs to confirm:

1. **Release Phase Logs:** Look for migration output:
   ```
   Applying migration '20251125035704_InitialCreatePostgreSQL'...
   Done.
   ```

2. **Application Logs:** Should show successful database connection:
   ```
   [DB Config] Using PostgreSQL database
   ```

## Troubleshooting

### Migrations Fail During Release

- Check Railway logs for the specific error
- Verify `DATABASE_URL` is correctly set in Railway Variables
- Ensure the Postgres service is running and accessible
- Check that migrations are committed to your repository

### App Starts Without Migrations

- Verify `releaseCommand` is in `railway.json`
- Check that Railway is using `railway.json` (not Procfile)
- Ensure the build process completed successfully

### Manual Migration

If you need to run migrations manually:

1. Railway Dashboard → Your Service → **Shell** tab
2. Run: `dotnet ef database update`

## Best Practices

- ✅ Always test migrations locally before deploying
- ✅ Keep migrations small and incremental
- ✅ Review migration SQL before committing
- ✅ Monitor Railway logs after each deployment
- ✅ Have a rollback plan for failed migrations

