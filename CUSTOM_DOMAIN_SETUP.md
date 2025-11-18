# 🌐 Custom Domain Setup: runtribes.app

## Overview
This guide covers setting up your custom domain `runtribes.app` for production on both Vercel (frontend) and Railway (backend).

## Step 1: Configure Vercel (Frontend)

### 1.1 Add Domain to Vercel
1. Go to Vercel Dashboard → Your Project (`runtribe`)
2. Go to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `runtribes.app`
5. Also add: `www.runtribes.app` (optional, for www subdomain)
6. Follow Vercel's DNS configuration instructions

### 1.2 Update Vercel Environment Variables
Go to **Settings** → **Environment Variables** and update:

```
NEXTAUTH_URL=https://runtribes.app
NEXT_PUBLIC_APP_URL=https://runtribes.app
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

**Important**: After updating environment variables, redeploy your Vercel project.

## Step 2: Configure Railway (Backend API)

### 2.1 Update CORS Settings
The CORS configuration has been updated in `appsettings.Production.json` to include:
- `https://runtribes.app`
- `https://www.runtribes.app`

### 2.2 Set Environment Variable (Alternative Method)
You can also set CORS via Railway environment variable:

In Railway Dashboard → `runners-app` → **Variables**, add:

```
Cors__AllowedOrigins=https://runtribes.app,https://www.runtribes.app,https://runtribe.vercel.app
```

**Note**: Environment variables override `appsettings.Production.json`, so use one method or the other.

### 2.3 Deploy Changes
After updating CORS settings, redeploy your Railway API:

```bash
cd RunTribe.Api
railway up
```

Or trigger a new deployment from Railway Dashboard.

## Step 3: DNS Configuration

### For Vercel (Frontend)
Configure your DNS records as instructed by Vercel:
- Usually involves adding CNAME records pointing to Vercel
- Vercel will provide the exact DNS records needed

### For Railway (Backend API)
If you want a custom domain for your API:
1. Railway Dashboard → `runners-app` → **Settings** → **Domains**
2. Add your custom domain (e.g., `api.runtribes.app`)
3. Configure DNS records as instructed by Railway

**Note**: Railway's default domain (`.railway.app`) works fine if you don't need a custom API domain.

## Step 4: Verify Configuration

### Test Frontend
1. Visit `https://runtribes.app` in your browser
2. Check browser console for any CORS errors
3. Test signup/login functionality

### Test API Connection
Open browser console on `https://runtribes.app` and run:

```javascript
fetch('https://your-railway-app.railway.app/weatherforecast')
  .then(res => res.json())
  .then(data => console.log('✅ API Working:', data))
  .catch(err => console.error('❌ Error:', err));
```

### Test CORS
Check that CORS headers are present:

```bash
curl -I -H "Origin: https://runtribes.app" https://your-railway-app.railway.app/weatherforecast
```

Look for `Access-Control-Allow-Origin: https://runtribes.app` in the response headers.

## Step 5: SSL/HTTPS

Both Vercel and Railway automatically provide SSL certificates:
- **Vercel**: Automatic SSL via Let's Encrypt
- **Railway**: Automatic SSL for custom domains

No additional configuration needed - just ensure your DNS is pointing correctly.

## Troubleshooting

### CORS Errors
- **Symptom**: Browser console shows CORS errors
- **Solution**: 
  1. Verify `runtribes.app` is in Railway CORS settings
  2. Check environment variables are set correctly
  3. Redeploy both Vercel and Railway after changes

### Domain Not Resolving
- **Symptom**: Can't access `runtribes.app`
- **Solution**: 
  1. Check DNS records are configured correctly
  2. Wait for DNS propagation (can take up to 48 hours)
  3. Verify domain is added in Vercel Dashboard

### NextAuth Errors
- **Symptom**: Authentication not working
- **Solution**: 
  1. Ensure `NEXTAUTH_URL=https://runtribes.app` is set in Vercel
  2. Redeploy Vercel after updating environment variables

## Configuration Summary

### Vercel Environment Variables
```
NEXTAUTH_URL=https://runtribes.app
NEXT_PUBLIC_APP_URL=https://runtribes.app
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
NEXTAUTH_SECRET=<your-secret>
```

### Railway CORS Configuration
```json
{
  "Cors": {
    "AllowedOrigins": [
      "https://runtribes.app",
      "https://www.runtribes.app",
      "https://runtribe.vercel.app",
      "http://localhost:3000"
    ]
  }
}
```

## Next Steps

1. ✅ Add domain to Vercel
2. ✅ Update Vercel environment variables
3. ✅ Update Railway CORS settings
4. ✅ Configure DNS records
5. ✅ Test frontend and API connection
6. ✅ Verify SSL certificates are active

