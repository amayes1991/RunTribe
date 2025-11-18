# 🧪 How to Test Your Railway Production API

## Step 1: Find Your Railway API URL

### Method 1: Railway Dashboard (Easiest)
1. Go to [Railway Dashboard](https://railway.app)
2. Click on your project → **`runners-app`** service
3. Look for the **"Settings"** tab
4. Find **"Domains"** or **"Public URL"** section
5. Your API URL will be something like: `https://runners-app-production.railway.app`

### Method 2: Railway CLI
```bash
cd RunTribe.Api
railway link  # Select your project and service
railway status  # Shows deployment URL
```

### Method 3: Check Deployments
1. Railway Dashboard → `runners-app` → **"Deployments"** tab
2. Click on the latest deployment
3. Look for the public URL in the deployment details

## Step 2: Test Your API

### Quick Browser Test

Open these URLs in your browser:

1. **Health Check Endpoint:**
   ```
   https://your-railway-app.railway.app/weatherforecast
   ```
   ✅ Should return JSON weather data

2. **Swagger Documentation (if enabled):**
   ```
   https://your-railway-app.railway.app/swagger
   ```
   ✅ Should show API documentation

### Using curl (Terminal)

```bash
# Test health endpoint
curl https://your-railway-app.railway.app/weatherforecast

# Test with verbose output to see headers
curl -v https://your-railway-app.railway.app/weatherforecast

# Test API endpoint (may require auth)
curl https://your-railway-app.railway.app/api/users
```

### Using a Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

# Replace with your actual Railway URL
API_URL="https://your-railway-app.railway.app"

echo "🧪 Testing Railway API: $API_URL"
echo ""

echo "1️⃣ Testing /weatherforecast endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/weatherforecast")
if [ "$response" = "200" ]; then
    echo "✅ Success! API is responding"
    curl -s "$API_URL/weatherforecast" | head -c 200
    echo "..."
else
    echo "❌ Failed with status code: $response"
fi

echo ""
echo "2️⃣ Testing /swagger endpoint..."
swagger_response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/swagger")
if [ "$swagger_response" = "200" ]; then
    echo "✅ Swagger is available"
else
    echo "⚠️  Swagger not available (status: $swagger_response)"
fi

echo ""
echo "3️⃣ Testing CORS headers..."
cors_headers=$(curl -s -I -H "Origin: https://runtribe.vercel.app" "$API_URL/weatherforecast" | grep -i "access-control")
if [ -n "$cors_headers" ]; then
    echo "✅ CORS headers present:"
    echo "$cors_headers"
else
    echo "⚠️  No CORS headers found"
fi
```

Run it:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Step 3: Test from Your Frontend

### In Browser Console (on your Vercel site)

```javascript
// Test API connection
fetch('https://your-railway-app.railway.app/weatherforecast')
  .then(res => res.json())
  .then(data => console.log('✅ API Working:', data))
  .catch(err => console.error('❌ API Error:', err));
```

### Check Network Tab
1. Open your Vercel site
2. Open Browser DevTools → Network tab
3. Try to sign up or log in
4. Look for requests to your Railway API
5. Check if they're successful (200) or failing (CORS, 404, etc.)

## Step 4: Common Issues & Solutions

### ❌ "Connection refused" or "Failed to fetch"
- **Solution**: Check Railway service is running and deployed
- Check Railway logs for errors

### ❌ CORS Errors
- **Solution**: Add your Vercel domain to Railway CORS settings:
  ```
  Cors__AllowedOrigins=https://runtribe.vercel.app,https://www.runtribe.vercel.app
  ```

### ❌ 404 Not Found
- **Solution**: Check the API URL is correct
- Verify the endpoint path exists in your API

### ❌ 500 Internal Server Error
- **Solution**: Check Railway logs
- Verify database connection
- Check environment variables are set

## Step 5: Verify Environment Variables

Make sure these are set in Railway (`runners-app` service):

```
ASPNETCORE_ENVIRONMENT=Production
DATABASE_URL=<your-postgres-connection-string>
```

## Quick Test Checklist

- [ ] Railway API URL is accessible in browser
- [ ] `/weatherforecast` endpoint returns data
- [ ] No CORS errors in browser console
- [ ] API responds to requests from Vercel frontend
- [ ] Database connection is working (check logs)

## Next Steps

Once your API is working:
1. Copy the Railway URL
2. Set it in Vercel as `NEXT_PUBLIC_API_URL`
3. Redeploy your Vercel frontend
4. Test signup/login functionality

