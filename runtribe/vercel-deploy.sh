#!/bin/bash

# Vercel CLI Deployment Script for RunTribes Frontend
echo "🚀 Deploying RunTribes Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first:"
    echo "Run: vercel login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Logged in to Vercel as: $(vercel whoami)"

# Deploy the project
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo "Your app is now live at the URL shown above."
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure custom domain (optional)"
echo "3. Test your live application"



