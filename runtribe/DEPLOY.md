# Vercel CLI Deployment Guide

## Quick Start

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy to production
vercel --prod --yes
```

## First Time Setup

```bash
# 1. Navigate to frontend directory
cd runtribe

# 2. Login to Vercel
vercel login

# 3. Deploy (interactive)
vercel

# 4. Set environment variables
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
vercel env add SENDGRID_API_KEY
vercel env add FROM_EMAIL

# 5. Deploy to production
vercel --prod
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Your Vercel app URL | `https://runtribe.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_API_URL` | Your API URL | `https://runtribe-api.railway.app` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIza...` |
| `SENDGRID_API_KEY` | SendGrid API key | `SG...` |
| `FROM_EMAIL` | Email sender | `noreply@yourdomain.com` |

## Useful Commands

```bash
# View all deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove

# Check status
vercel status
```

## Troubleshooting

- **Build fails**: Check `vercel logs` for errors
- **Environment variables not working**: Ensure they're set with `vercel env ls`
- **CORS errors**: Update your API CORS settings
- **Authentication issues**: Check NEXTAUTH_URL and NEXTAUTH_SECRET



