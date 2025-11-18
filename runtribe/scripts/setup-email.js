#!/usr/bin/env node

/**
 * Email Service Setup Script
 * This script helps you configure email services for different environments
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEmail() {
  console.log('🚀 RunTribe Email Service Setup\n');
  
  try {
    // Get environment
    const environment = await question('Which environment are you setting up? (development/production): ');
    
    if (!['development', 'production'].includes(environment)) {
      console.log('❌ Invalid environment. Please choose development or production.');
      rl.close();
      return;
    }
    
    console.log(`\n📧 Setting up ${environment} environment...\n`);
    
    // Get SendGrid API key
    const sendgridKey = await question('Enter your SendGrid API Key (or press Enter to skip): ');
    
    // Get sender email
    const fromEmail = await question('Enter your sender email (e.g., noreply@yourdomain.com): ');
    
    // Get app URL
    let appUrl;
    if (environment === 'development') {
      appUrl = await question('Enter your local app URL (default: http://localhost:3001): ') || 'http://localhost:3001';
    } else {
      appUrl = await question('Enter your production app URL (e.g., https://yourdomain.com): ');
    }
    
    // Get email provider preference for development
    let localProvider = 'sendgrid';
    if (environment === 'development') {
      const providerChoice = await question('Choose email provider for local development (sendgrid/console): ') || 'console';
      localProvider = ['sendgrid', 'console'].includes(providerChoice) ? providerChoice : 'console';
    }
    
    // Create environment variables
    const envContent = `# ${environment.charAt(0).toUpperCase() + environment.slice(1)} Environment Configuration
NODE_ENV=${environment}

# Email Service Configuration
SENDGRID_API_KEY=${sendgridKey || 'your_sendgrid_api_key_here'}
FROM_EMAIL=${fromEmail}
LOCAL_EMAIL_PROVIDER=${localProvider}

# App Configuration
NEXT_PUBLIC_APP_URL=${appUrl}

# Database Configuration
DATABASE_URL=your_${environment}_database_url

# NextAuth Configuration
NEXTAUTH_SECRET=your_${environment}_secret_here
NEXTAUTH_URL=${appUrl}
`;
    
    // Write to .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Environment configuration created successfully!');
    console.log(`📁 Configuration saved to: ${envPath}`);
    
    // Show next steps
    console.log('\n📋 Next Steps:');
    
    if (environment === 'development') {
      if (localProvider === 'console') {
        console.log('1. ✅ Console mode enabled - emails will be logged to console');
        console.log('2. 🔑 To enable real emails, add your SendGrid API key to .env.local');
      } else {
        console.log('1. 🔑 Add your SendGrid API key to .env.local');
        console.log('2. 📧 Verify your sender email in SendGrid dashboard');
      }
    } else {
      console.log('1. 🔑 Add your SendGrid API key to .env.local');
      console.log('2. 📧 Verify your sender email in SendGrid dashboard');
      console.log('3. 🌐 Ensure your domain is properly configured');
    }
    
    console.log('3. 🚀 Restart your development server');
    console.log('4. 🧪 Test the forgot password functionality');
    
    // Show SendGrid setup instructions
    if (!sendgridKey) {
      console.log('\n📚 SendGrid Setup Instructions:');
      console.log('1. Go to https://sendgrid.com and create a free account');
      console.log('2. Navigate to Settings → API Keys');
      console.log('3. Create a new API Key with "Mail Send" permissions');
      console.log('4. Copy the API key and add it to .env.local');
      console.log('5. Go to Settings → Sender Authentication');
      console.log('6. Verify your sender email address');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupEmail();
}

module.exports = { setupEmail };

