// Email configuration for different environments
const emailConfig = {
  // Development environment
  development: {
    provider: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@runtribe.com',
    fromName: 'RunTribe',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    // For local development, you can use a test email service
    testMode: process.env.NODE_ENV === 'development',
    // Optional: Use a different service for local development
    localProvider: process.env.LOCAL_EMAIL_PROVIDER || 'sendgrid' // 'sendgrid', 'ethereal', 'console'
  },

  // Production environment
  production: {
    provider: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@runtribe.com',
    fromName: 'RunTribe',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com',
    testMode: false,
    localProvider: 'sendgrid'
  },

  // Test environment
  test: {
    provider: 'console',
    apiKey: null,
    fromEmail: 'test@runtribe.com',
    fromName: 'RunTribe Test',
    baseUrl: 'http://localhost:3000',
    testMode: true,
    localProvider: 'console'
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (process.env.NODE_ENV === 'test') return 'test';
  return 'development';
};

// Get current config
const getCurrentConfig = () => {
  const env = getCurrentEnvironment();
  return emailConfig[env];
};

// Validate configuration
const validateConfig = (config) => {
  const errors = [];
  
  if (!config.apiKey && config.provider === 'sendgrid') {
    errors.push('SENDGRID_API_KEY is required for SendGrid provider');
  }
  
  if (!config.fromEmail) {
    errors.push('FROM_EMAIL is required');
  }
  
  if (!config.baseUrl) {
    errors.push('NEXT_PUBLIC_APP_URL is required');
  }
  
  return errors;
};

export { emailConfig, getCurrentEnvironment, getCurrentConfig, validateConfig };
export default getCurrentConfig;

