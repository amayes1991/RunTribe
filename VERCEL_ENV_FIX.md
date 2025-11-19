# Fix Vercel Environment Variables Not Working

## The Problem
Your app is still using `localhost:5071` even after setting `NEXT_PUBLIC_API_URL` in Vercel.

## Solution Steps

### 1. Verify Variable is Set Correctly
In Vercel Dashboard → Settings → Environment Variables:

**Variable Name:** `NEXT_PUBLIC_API_URL` (exact, case-sensitive)
**Variable Value:** `https://runtribe-app-production.up.railway.app` (with https://)
**Environments:** MUST check ALL THREE:
- ✅ Production
- ✅ Preview  
- ✅ Development

**IMPORTANT:** If you only set it for Production, Preview deployments (like the one you're testing) won't have it!

### 2. Delete and Re-add the Variable
Sometimes Vercel caches old values. Try:
1. Delete the `NEXT_PUBLIC_API_URL` variable
2. Add it again with the correct value: `https://runtribe-app-production.up.railway.app`
3. Make sure ALL environments are selected
4. Save

### 3. Force a New Deployment
After updating the variable:
1. Go to Deployments tab
2. Click the three dots (⋯) on the latest deployment
3. Click "Redeploy"
4. **OR** push a new commit to trigger a fresh build

### 4. Verify Build Logs
Check the deployment logs to see if the variable is being used:
1. Vercel Dashboard → Deployments
2. Click on the deployment
3. Check "Build Logs"
4. Look for any errors or confirm the build completed

### 5. Test After Redeploy
After redeploying, test:
1. Visit your site
2. Open DevTools → Network tab
3. Try to sign up
4. Check the request URL - it should be `https://runtribe-app-production.up.railway.app/api/auth/register`
5. NOT `http://localhost:5071`

## Why Preview Deployments Need the Variable Too

Vercel creates separate builds for:
- **Production**: Your main domain (runtribes.app)
- **Preview**: Branch deployments (runtribe-xxx.vercel.app)
- **Development**: Local development

If you only set the variable for Production, Preview deployments will fall back to `localhost:5071`.

## Quick Checklist

- [ ] Variable name is exactly: `NEXT_PUBLIC_API_URL`
- [ ] Variable value includes `https://`: `https://runtribe-app-production.up.railway.app`
- [ ] All three environments are selected (Production, Preview, Development)
- [ ] Variable was saved
- [ ] Deployment was triggered after setting the variable
- [ ] Build logs show no errors
- [ ] Network tab shows requests to Railway URL, not localhost

## Alternative: Set via Vercel CLI

If the dashboard isn't working, try CLI:

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Set the variable for all environments
vercel env add NEXT_PUBLIC_API_URL production preview development

# When prompted, enter: https://runtribe-app-production.up.railway.app
```

Then redeploy.

