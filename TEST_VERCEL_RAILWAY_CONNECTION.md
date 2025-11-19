# 🧪 Testing Vercel Frontend ↔ Railway Backend Connection

## Prerequisites

1. ✅ Railway API is deployed and running
2. ✅ Vercel frontend is deployed
3. ✅ Environment variables are set in Vercel

## Step 1: Verify Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify these are set:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
   NEXTAUTH_URL=https://runtribes.app (or your domain)
   NEXTAUTH_SECRET=<your-secret>
   ```
3. **Important**: After setting/changing variables, **redeploy** your Vercel project

## Step 2: Test in Browser Console

### Method 1: Quick API Test

1. Open your Vercel site (e.g., `https://runtribes.app`)
2. Open Browser DevTools (F12 or Cmd+Option+I)
3. Go to **Console** tab
4. Run this test:

```javascript
// Test API connection
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://your-railway-app.railway.app';
console.log('Testing API URL:', apiUrl);

fetch(`${apiUrl}/weatherforecast`)
  .then(res => {
    console.log('✅ Response Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('✅ API Working! Data:', data);
  })
  .catch(err => {
    console.error('❌ API Error:', err);
  });
```

**Expected Result**: Should see weather forecast data, not errors.

### Method 2: Test from Your App Code

Since `NEXT_PUBLIC_API_URL` is a public env var, you can test it directly:

```javascript
// In browser console
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Or test a fetch
fetch(`${process.env.NEXT_PUBLIC_API_URL}/weatherforecast`)
  .then(r => r.json())
  .then(d => console.log('✅ API Response:', d))
  .catch(e => console.error('❌ Error:', e));
```

## Step 3: Check Network Tab

1. Open your Vercel site
2. Open DevTools → **Network** tab
3. Try to:
   - Sign up
   - Log in
   - View groups
   - Any action that calls the API

4. Look for requests to your Railway API:
   - **Good**: Requests to `https://your-railway-app.railway.app/api/...`
   - **Status**: Should be `200` (success) or `401` (unauthorized, but API is working)
   - **Bad**: `CORS error`, `Failed to fetch`, or `404`

### Common Network Tab Issues:

**❌ CORS Error:**
```
Access to fetch at 'https://...' from origin 'https://runtribes.app' has been blocked by CORS policy
```
**Solution**: Add your Vercel domain to Railway CORS settings

**❌ Failed to fetch:**
- Check Railway API is running
- Verify the API URL is correct
- Check browser console for more details

**❌ 404 Not Found:**
- Verify the endpoint path is correct
- Check Railway logs for routing issues

## Step 4: Test Authentication Flow

### Test Signup

1. Go to your signup page
2. Fill out the form
3. Submit
4. Check Network tab for:
   - POST request to `/api/auth/register` or similar
   - Should return `200` or `201` on success
   - Check response for user data or error messages

### Test Login

1. Go to login page
2. Enter credentials
3. Submit
4. Check Network tab for:
   - POST request to `/api/auth/login`
   - Should return `200` with user data
   - Check if session is created

## Step 5: Test Specific Endpoints

### Using Browser Console

```javascript
const apiUrl = 'https://your-railway-app.railway.app';

// Test 1: Health check
fetch(`${apiUrl}/weatherforecast`)
  .then(r => r.json())
  .then(d => console.log('✅ Health check:', d));

// Test 2: Get users (may require auth)
fetch(`${apiUrl}/api/users`)
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log('Users:', d))
  .catch(e => console.error('Error:', e));

// Test 3: Test CORS
fetch(`${apiUrl}/weatherforecast`, {
  method: 'GET',
  headers: {
    'Origin': window.location.origin
  }
})
  .then(r => {
    console.log('CORS Headers:', r.headers.get('Access-Control-Allow-Origin'));
    return r.json();
  })
  .then(d => console.log('✅ CORS working:', d));
```

## Step 6: Check Railway Logs

1. Railway Dashboard → `runners-app` → **Logs**
2. Try an action on your Vercel site
3. Watch Railway logs for:
   - Incoming requests
   - Any errors
   - Database queries

**What to look for:**
- ✅ Requests appearing in logs = Connection working
- ❌ No requests = API URL might be wrong or CORS blocking
- ❌ Errors in logs = Backend issue to fix

## Step 7: Test from Terminal (curl)

```bash
# Test Railway API directly
curl https://your-railway-app.railway.app/weatherforecast

# Test with CORS headers (simulating Vercel request)
curl -H "Origin: https://runtribes.app" \
     -H "Access-Control-Request-Method: GET" \
     -v \
     https://your-railway-app.railway.app/weatherforecast

# Look for: Access-Control-Allow-Origin in response headers
```

## Step 8: Verify CORS Configuration

### Check Railway CORS Settings

1. Railway Dashboard → `runners-app` → **Variables**
2. Verify `Cors__AllowedOrigins` includes your Vercel domain:
   ```
   Cors__AllowedOrigins=https://runtribes.app,https://www.runtribes.app
   ```

Or check `appsettings.Production.json` has your domain in the CORS array.

### Test CORS Headers

In browser console:
```javascript
fetch('https://your-railway-app.railway.app/weatherforecast')
  .then(r => {
    console.log('CORS Headers:');
    console.log('Access-Control-Allow-Origin:', r.headers.get('Access-Control-Allow-Origin'));
    console.log('Access-Control-Allow-Methods:', r.headers.get('Access-Control-Allow-Methods'));
    return r.json();
  });
```

## Step 9: Full Integration Test

### Test Complete User Flow

1. **Signup**:
   - Go to signup page
   - Fill form and submit
   - Check Network tab for successful API call
   - Verify user is created

2. **Login**:
   - Go to login page
   - Enter credentials
   - Check Network tab for successful auth
   - Verify you're redirected/logged in

3. **Use App Features**:
   - Create a group
   - View groups
   - Any feature that uses the API
   - Check Network tab for all API calls

## Troubleshooting

### Issue: "Failed to fetch" or Network Error

**Possible Causes:**
1. Railway API is down → Check Railway logs
2. Wrong API URL → Verify `NEXT_PUBLIC_API_URL` in Vercel
3. CORS blocking → Check CORS configuration

**Solution:**
```javascript
// In browser console, check what API URL is being used
console.log('API URL from env:', process.env.NEXT_PUBLIC_API_URL);

// Test direct connection
fetch('https://your-railway-app.railway.app/weatherforecast')
  .then(r => console.log('Direct test:', r.status))
  .catch(e => console.error('Direct test failed:', e));
```

### Issue: CORS Errors

**Error Message:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution:**
1. Add your Vercel domain to Railway CORS:
   ```
   Cors__AllowedOrigins=https://runtribes.app,https://www.runtribes.app
   ```
2. Redeploy Railway
3. Clear browser cache and retry

### Issue: 401 Unauthorized

**This is actually good!** It means:
- ✅ Connection is working
- ✅ API is responding
- ⚠️ You just need to authenticate

**Solution:** Make sure you're logged in or include auth tokens in requests.

### Issue: 404 Not Found

**Possible Causes:**
- Wrong endpoint path
- API route doesn't exist
- API not deployed correctly

**Solution:**
- Check Railway logs for routing
- Verify endpoint exists in your API
- Test endpoint directly: `https://your-railway-app.railway.app/api/endpoint`

## Quick Test Checklist

- [ ] Railway API is accessible: `https://your-railway-app.railway.app/weatherforecast`
- [ ] Vercel environment variables are set correctly
- [ ] Vercel has been redeployed after setting env vars
- [ ] Browser console shows API URL correctly
- [ ] Network tab shows requests to Railway API
- [ ] No CORS errors in console
- [ ] Railway logs show incoming requests
- [ ] Signup/login works end-to-end

## Success Indicators

✅ **Connection is working if:**
- Browser console shows successful API responses
- Network tab shows `200` status codes
- No CORS errors
- Railway logs show incoming requests
- App features work (signup, login, data loading)

❌ **Connection is NOT working if:**
- "Failed to fetch" errors
- CORS errors in console
- No requests appear in Railway logs
- All API calls return errors

## Next Steps After Testing

Once connection is verified:
1. Test all major features
2. Monitor Railway logs for errors
3. Set up error tracking (Sentry, etc.)
4. Configure monitoring/alerts
5. Test performance and optimize if needed

