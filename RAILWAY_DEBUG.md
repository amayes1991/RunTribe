# Railway API Debugging Guide

## Issues You're Experiencing

1. **404 on root URL** (`https://runtribe-app-production.up.railway.app/`)
   - This is **NORMAL** - your API doesn't have a root route
   - Test the health check endpoint instead: `/weatherforecast`

2. **500 Internal Server Error** on `/api/auth/register`
   - This means the API is running but encountering an error
   - Need to check Railway logs to see the actual error

## Step 1: Test Health Check Endpoint

Visit this URL in your browser:
```
https://runtribe-app-production.up.railway.app/weatherforecast
```

**Expected:** JSON weather data
**If 404:** API might not be deployed correctly
**If 500:** API is running but has an error

## Step 2: Check Railway Logs

1. Go to Railway Dashboard → `runners-app` service
2. Click on **"Logs"** tab
3. Look for:
   - Error messages when you try to register
   - Database connection errors
   - Any stack traces

**Common errors to look for:**
- Database connection errors
- Missing environment variables
- Migration errors
- CORS errors

## Step 3: Check Railway Deployment Status

1. Railway Dashboard → `runners-app` → **"Deployments"** tab
2. Check if the latest deployment is:
   - ✅ **Active** (green) = Running
   - ❌ **Failed** (red) = Not running
   - ⏳ **Building** = Still deploying

## Step 4: Verify Environment Variables

Railway Dashboard → `runners-app` → **"Variables"** tab

**Required variables:**
- `ASPNETCORE_ENVIRONMENT=Production`
- `DATABASE_URL` (should match `DATABASE_PUBLIC_URL` from Postgres service)

## Step 5: Check Database Migrations

The 500 error might be because:
- Database migrations haven't been run
- Database tables don't exist
- Database connection is failing

**To run migrations:**
1. Railway Dashboard → `runners-app` → **"Deployments"** tab
2. Click **"New Deployment"** → **"Run Command"**
3. Enter: `dotnet ef database update`
4. Click **"Deploy"**

## Step 6: Test API Endpoints

### Test Health Check:
```bash
curl https://runtribe-app-production.up.railway.app/weatherforecast
```

### Test Register Endpoint:
```bash
curl -X POST https://runtribe-app-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456","name":"Test User"}'
```

## Common Issues & Solutions

### Issue: 500 Error on Register
**Possible causes:**
1. Database migrations not run → Run migrations
2. Database connection failing → Check `DATABASE_URL`
3. Missing required fields → Check request body
4. Application error → Check Railway logs

### Issue: 404 on Root URL
**Solution:** This is normal. Use `/weatherforecast` or `/api/` endpoints instead.

### Issue: API Not Responding
**Check:**
1. Is deployment active?
2. Are there errors in logs?
3. Is the service running?

## Quick Checklist

- [ ] Health check works: `/weatherforecast` returns data
- [ ] Railway logs show no errors
- [ ] Database migrations have been run
- [ ] Environment variables are set correctly
- [ ] Deployment status is "Active"

