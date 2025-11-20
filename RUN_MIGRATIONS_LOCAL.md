# Run Migrations Locally Against Production Database

## ⚠️ Important Warning
**Be careful!** You're connecting to the production database. Make sure you:
- Have the correct connection string
- Don't accidentally drop tables or data
- Test migrations on a backup first if possible

## Step 1: Get Your Production Database Connection String

1. Go to Railway Dashboard → Your Project → **Postgres** service
2. Click on **"Variables"** tab
3. Find **`DATABASE_PUBLIC_URL`**
4. Click the eye icon to reveal the value
5. **Copy the entire connection string** (looks like: `postgresql://postgres:password@host:port/database`)

## Step 2: Set Environment Variable Locally

### Option A: Set for Current Terminal Session

```bash
cd RunTribe.Api

# Set the connection string (replace with your actual Railway connection string)
export DATABASE_URL="postgresql://postgres:your-password@your-host:port/database"

# Or use DATABASE_PUBLIC_URL
export DATABASE_PUBLIC_URL="postgresql://postgres:your-password@your-host:port/database"

# Set production environment
export ASPNETCORE_ENVIRONMENT=Production

# Run migrations
dotnet ef database update
```

### Option B: Create a .env File (Recommended)

Create a file `RunTribe.Api/.env` (add to .gitignore!):

```bash
DATABASE_URL=postgresql://postgres:your-password@your-host:port/database
ASPNETCORE_ENVIRONMENT=Production
```

Then source it:
```bash
cd RunTribe.Api
source .env  # or: set -a; source .env; set +a
dotnet ef database update
```

### Option C: Use Railway CLI to Get Connection String

```bash
# Install Railway CLI if needed
curl -fsSL https://railway.app/install.sh | sh

# Login and link
cd RunTribe.Api
railway login
railway link  # Select: runners-app

# Get the connection string
railway variables

# Copy DATABASE_PUBLIC_URL value, then:
export DATABASE_URL="<paste-value-here>"
export ASPNETCORE_ENVIRONMENT=Production
dotnet ef database update
```

## Step 3: Run Migrations

```bash
cd RunTribe.Api
dotnet ef database update
```

## Step 4: Verify

After migrations complete:
1. Try signing up on your production site
2. Check Railway logs to see if it works
3. Verify tables were created in Railway Postgres

## Security Note

**Never commit your `.env` file or connection strings to git!**

Make sure `.env` is in `.gitignore`:
```bash
echo ".env" >> RunTribe.Api/.gitignore
```

## Quick One-Liner

If you have the connection string ready:

```bash
cd RunTribe.Api && \
DATABASE_URL="postgresql://postgres:password@host:port/db" \
ASPNETCORE_ENVIRONMENT=Production \
dotnet ef database update
```

Replace the connection string with your actual Railway `DATABASE_PUBLIC_URL` value.

