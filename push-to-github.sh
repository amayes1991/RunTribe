#!/bin/bash

# Script to push RunTribe to GitHub
# Run this AFTER creating the repository on GitHub.com

echo "🚀 Pushing RunTribe to GitHub..."

# Replace 'yourusername' and 'RunTribe' with your actual GitHub username and repository name
GITHUB_USERNAME="yourusername"
REPOSITORY_NAME="RunTribe"

echo "📝 Please update the GITHUB_USERNAME and REPOSITORY_NAME variables in this script"
echo "   Current values:"
echo "   GITHUB_USERNAME: $GITHUB_USERNAME"
echo "   REPOSITORY_NAME: $REPOSITORY_NAME"
echo ""
echo "   Then run:"
echo "   git remote add origin https://github.com/$GITHUB_USERNAME/$REPOSITORY_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "   Or run this script after updating the variables above."

# Uncomment these lines after updating the variables above:
# git remote add origin https://github.com/$GITHUB_USERNAME/$REPOSITORY_NAME.git
# git branch -M main
# git push -u origin main

echo "✅ Ready to push to GitHub!"



