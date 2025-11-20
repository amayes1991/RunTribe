# How to Run Database Migrations on Railway

## Method 1: Using Railway Dashboard Shell (Easiest)

1. Go to Railway Dashboard → Your Project → **`runners-app`** service
2. Click on the **"Shell"** tab (next to Deployments, Variables, etc.)
3. This opens a terminal in your Railway container
4. Run: `dotnet ef database update`
5. Wait for it to complete

## Method 2: Using Railway Dashboard Deployments

1. Go to Railway Dashboard → Your Project → **`runners-app`** service
2. Click on **"Deployments"** tab
3. Click **"New Deployment"** button (usually at the top)
4. Select **"Run Command"** or **"One-off Command"**
5. Enter: `dotnet ef database update`
6. Click **"Deploy"** or **"Run"**
7. Watch the logs to see the migration progress

## Method 3: Using Railway CLI

```bash
# Make sure you're in the RunTribe.Api directory
cd RunTribe.Api

# Link to Railway (if not already linked)
railway link
# Select: runners-app (your API service)

# Run migrations
railway run dotnet ef database update
```

## What to Expect

After running migrations, you should see:
- Messages about applying migrations
- "Done." at the end if successful
- Any errors will be displayed

## Troubleshooting

### "No migrations found"
- Make sure you're running from the `RunTribe.Api` directory
- Check that migrations exist in `RunTribe.Api/Migrations/`

### "Connection string error"
- Verify `DATABASE_URL` is set in Railway Variables
- Make sure it matches `DATABASE_PUBLIC_URL` from Postgres service

### "Table already exists"
- Migrations may have already been run
- Check Railway logs to see if tables were created

## Verify Migrations Worked

After running migrations, try registering a user. If it works, migrations were successful!

