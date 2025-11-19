# Fix Railway Database Connection Error

## The Problem
Error: `The ConnectionString property has not been initialized`

This means the database connection string is not being read from Railway environment variables.

## Solution: Set DATABASE_URL in Railway

### Step 1: Get Your PostgreSQL Connection String

1. Go to Railway Dashboard → Your Project
2. Click on the **Postgres** service
3. Go to **"Variables"** tab
4. Find **`DATABASE_PUBLIC_URL`**
5. **Copy the entire value** (it looks like: `postgresql://postgres:password@host:port/database`)

### Step 2: Set DATABASE_URL in Your API Service

1. Go to Railway Dashboard → Your Project
2. Click on **`runners-app`** service (your API)
3. Go to **"Variables"** tab
4. Click **"New Variable"**
5. Set:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the value you copied from `DATABASE_PUBLIC_URL`
6. Click **"Add"**

### Step 3: Verify ASPNETCORE_ENVIRONMENT is Set

Make sure you also have:
- **Key**: `ASPNETCORE_ENVIRONMENT`
- **Value**: `Production`

### Step 4: Redeploy

After setting the variables:
1. Railway Dashboard → `runners-app` → **"Deployments"**
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger deployment

## Why This Happens

Railway provides `DATABASE_PUBLIC_URL` from the Postgres service, but:
- It might not be automatically linked to your API service
- The code needs `DATABASE_URL` or `DATABASE_PUBLIC_URL` to be explicitly set
- Setting `DATABASE_URL` ensures the connection string is available

## Verify It's Working

After redeploying, check Railway logs:
1. Railway Dashboard → `runners-app` → **"Logs"**
2. Look for successful database connection messages
3. Try registering again - should work now!

## Alternative: Use Railway's Auto-Linking

Railway should automatically link `DATABASE_PUBLIC_URL` from Postgres to your API service. If it's not working:

1. Make sure both services are in the same Railway project
2. Check Postgres service → Variables → `DATABASE_PUBLIC_URL` exists
3. The API service should automatically have access to it

If auto-linking isn't working, manually set `DATABASE_URL` as described above.

