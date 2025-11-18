# RunTribe Deployment Guide

## 🚀 Deployment Options

### Option 1: Cloud Platform Deployment (Recommended)

#### Backend (.NET API) - Deploy to Azure App Service

1. **Prepare the API**:
   ```bash
   cd RunTribe.Api
   dotnet publish -c Release -o ./publish
   ```

2. **Create Azure App Service**:
   - Go to Azure Portal
   - Create new App Service
   - Choose .NET 8 runtime
   - Upload your published files

3. **Configure Database**:
   - Create Azure SQL Database
   - Update connection string in App Service settings
   - Run migrations: `dotnet ef database update`

#### Frontend (Next.js) - Deploy to Vercel

1. **Connect Repository**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `.next`

2. **Environment Variables**:
   ```
   NEXTAUTH_URL=https://yourdomain.vercel.app
   NEXTAUTH_SECRET=your-secret-here
   NEXT_PUBLIC_API_URL=https://your-api.azurewebsites.net
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
   SENDGRID_API_KEY=your-sendgrid-key
   FROM_EMAIL=noreply@yourdomain.com
   ```

### Option 2: Docker Deployment (Self-hosted)

#### Using Docker Compose

1. **Create Environment File**:
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

2. **Deploy with Docker**:
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

3. **Run Database Migrations**:
   ```bash
   docker exec -it runtribe-api dotnet ef database update
   ```

#### Using Docker Swarm or Kubernetes

1. **Build Images**:
   ```bash
   docker build -t runtribe-api ./RunTribe.Api
   docker build -t runtribe-frontend ./runtribe
   ```

2. **Deploy to Swarm**:
   ```bash
   docker stack deploy -c docker-compose.production.yml runtribe
   ```

### Option 3: Traditional VPS Deployment

#### Server Requirements
- Ubuntu 20.04+ or CentOS 8+
- Docker and Docker Compose
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

#### Setup Steps

1. **Install Dependencies**:
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   
   # Install Nginx
   sudo apt update
   sudo apt install nginx
   ```

2. **Deploy Application**:
   ```bash
   git clone your-repo
   cd RunApp
   docker-compose -f docker-compose.production.yml up -d
   ```

3. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **SSL Certificate**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## 🔧 Pre-Deployment Checklist

### Backend (.NET API)
- [ ] Update `appsettings.json` for production database
- [ ] Configure CORS for frontend domain
- [ ] Set up proper logging
- [ ] Configure file upload paths
- [ ] Set up health checks
- [ ] Configure SignalR for production

### Frontend (Next.js)
- [ ] Update API endpoints to production URLs
- [ ] Configure NextAuth for production domain
- [ ] Set up proper error handling
- [ ] Configure image optimization
- [ ] Set up analytics (optional)

### Database
- [ ] Run all migrations
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Set up monitoring

### Security
- [ ] Use strong passwords
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Regular security updates

## 📊 Monitoring & Maintenance

### Health Checks
- API: `GET /health` (implement if not exists)
- Database: Monitor connection status
- Frontend: Monitor build status

### Logging
- Application logs
- Error tracking (Sentry, LogRocket)
- Performance monitoring

### Backups
- Database backups (daily)
- File uploads backup
- Configuration backup

## 🚨 Troubleshooting

### Common Issues
1. **CORS errors**: Update CORS policy in API
2. **Database connection**: Check connection strings
3. **File uploads**: Verify file permissions
4. **SignalR**: Check WebSocket configuration

### Debug Commands
```bash
# Check container status
docker ps

# View logs
docker logs runtribe-api
docker logs runtribe-frontend

# Access container shell
docker exec -it runtribe-api bash
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer for multiple API instances
- Implement Redis for SignalR scaling
- Use CDN for static assets

### Database Scaling
- Consider read replicas
- Implement caching (Redis)
- Database connection pooling

### Performance Optimization
- Enable gzip compression
- Optimize images
- Implement caching strategies
- Use CDN for static assets



