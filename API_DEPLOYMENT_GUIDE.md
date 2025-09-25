# 🚀 RunTribe API Deployment Guide

## Overview
This guide will help you deploy your .NET API to Railway and connect it with your Vercel frontend.

## Step 1: Deploy API to Railway

### 1.1 Sign up for Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Connect your `RunApp` repository

### 1.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `RunApp` repository
4. **Important**: Set the root directory to `RunTribe.Api`
5. Railway will automatically detect it's a .NET project

### 1.3 Add Database
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provide connection variables

### 1.4 Configure Environment Variables
In your Railway project settings, add these environment variables:

```
ASPNETCORE_ENVIRONMENT=Production
DATABASE_URL=your-postgres-connection-string
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

### 1.5 Deploy
Railway will automatically:
- Build your .NET project
- Deploy it
- Provide you with a URL like `https://your-app-name.railway.app`

### 1.6 Run Database Migrations
After deployment, run migrations:
```bash
# Using Railway CLI
railway run dotnet ef database update

# Or using Railway dashboard terminal
```

## Step 2: Update Frontend for Production

### 2.1 Update Vercel Environment Variables
In your Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your-production-secret-here
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
```

### 2.2 Update API CORS Settings
In your Railway project, add this environment variable:
```
Cors__AllowedOrigins=https://your-vercel-app.vercel.app,https://www.your-vercel-app.vercel.app
```

## Step 3: Test Your Deployment

### 3.1 Test API Endpoints
Visit your Railway API URL:
- `https://your-app.railway.app/weatherforecast` - Should return weather data
- `https://your-app.railway.app/api/users` - Should return user data (if authenticated)

### 3.2 Test Frontend Connection
1. Deploy your frontend to Vercel
2. Check browser console for any CORS errors
3. Test login/registration functionality
4. Test API calls from your frontend

## Step 4: Production Checklist

### ✅ API Configuration
- [ ] Database migrations run successfully
- [ ] CORS configured for Vercel domain
- [ ] Environment variables set correctly
- [ ] File upload paths configured
- [ ] SignalR hub working

### ✅ Frontend Configuration
- [ ] API URL points to Railway
- [ ] NextAuth configured for production domain
- [ ] All environment variables set in Vercel
- [ ] Google Maps API key configured
- [ ] Email service configured

### ✅ Security
- [ ] Strong passwords for database
- [ ] HTTPS enabled on both platforms
- [ ] CORS properly configured
- [ ] Environment variables secured

## Troubleshooting

### Common Issues

#### CORS Errors
If you see CORS errors in browser console:
1. Check Railway environment variables
2. Ensure your Vercel domain is in the CORS allowed origins
3. Verify the API is using the Production CORS policy

#### Database Connection Issues
1. Check database connection string in Railway
2. Ensure database is running and accessible
3. Run migrations: `railway run dotnet ef database update`

#### SignalR Connection Issues
1. Verify the API URL is correct in frontend
2. Check that SignalR hub is properly configured
3. Ensure WebSocket connections are allowed

### Debug Commands
```bash
# Check Railway logs
railway logs

# Access Railway container
railway shell

# Run migrations
railway run dotnet ef database update
```

## Alternative Deployment Options

### Option 1: Azure App Service
1. Create Azure App Service
2. Deploy your API code
3. Configure Azure SQL Database
4. Update frontend API URL

### Option 2: AWS Elastic Beanstalk
1. Create Elastic Beanstalk environment
2. Deploy .NET application
3. Configure RDS database
4. Update frontend API URL

### Option 3: Docker on VPS
1. Use your existing Docker setup
2. Deploy to cloud server (DigitalOcean, Linode, etc.)
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates

## Cost Considerations

### Railway
- Free tier: $5/month for hobby plan
- Database: Included in project
- Bandwidth: Generous limits

### Azure App Service
- Free tier: Limited
- Basic plan: ~$13/month
- Database: Additional cost

### AWS Elastic Beanstalk
- Free tier: 12 months
- After free tier: ~$20-30/month
- Database: Additional cost

## Next Steps

1. **Monitor Performance**: Set up logging and monitoring
2. **Backup Strategy**: Configure database backups
3. **Scaling**: Plan for horizontal scaling if needed
4. **Security**: Regular security updates and audits
5. **Analytics**: Add user analytics and performance monitoring

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- .NET Documentation: [docs.microsoft.com/dotnet](https://docs.microsoft.com/dotnet)
