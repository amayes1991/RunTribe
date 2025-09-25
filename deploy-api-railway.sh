#!/bin/bash

# Railway Deployment Script for RunTribe API
echo "🚀 Deploying RunTribe API to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    curl -fsSL https://railway.app/install.sh | sh
    echo "✅ Railway CLI installed. Please restart your terminal and run this script again."
    exit 1
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Navigate to API directory
cd RunTribe.Api

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment initiated! Check your Railway dashboard for the deployment URL."
echo "📝 Don't forget to:"
echo "   1. Add your database connection variables in Railway"
echo "   2. Update your Vercel frontend with the new API URL"
echo "   3. Run database migrations: railway run dotnet ef database update"
