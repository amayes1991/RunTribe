#!/bin/bash

# Frontend Deployment Script for Portfolio
echo "🚀 Deploying RunTribe Frontend..."

# Navigate to frontend directory
cd runtribe

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready for deployment."
    echo ""
    echo "📋 Next steps:"
    echo "1. Push to GitHub: git add . && git commit -m 'Ready for deployment' && git push"
    echo "2. Deploy to Vercel:"
    echo "   - Go to vercel.com"
    echo "   - Import your repository"
    echo "   - Set Root Directory to 'runtribe'"
    echo "   - Add environment variables"
    echo "   - Deploy!"
    echo ""
    echo "🌐 Your app will be available at: https://your-app-name.vercel.app"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi



