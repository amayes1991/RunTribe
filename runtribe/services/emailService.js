import sgMail from '@sendgrid/mail';
import getCurrentConfig, { validateConfig } from '../config/email.js';

// Get current configuration
const config = getCurrentConfig();

// Validate configuration
const validationErrors = validateConfig(config);
if (validationErrors.length > 0) {
  console.warn('Email configuration warnings:', validationErrors);
}

// Initialize SendGrid if API key is available
if (config.apiKey && config.provider === 'sendgrid') {
  sgMail.setApiKey(config.apiKey);
}

export const emailService = {
  /**
   * Send password reset email
   * @param {string} to - Recipient email
   * @param {string} resetToken - Password reset token
   * @param {string} userName - User's name (optional)
   */
  async sendPasswordResetEmail(to, resetToken, userName = 'there') {
    try {
      const resetLink = `${config.baseUrl}/reset-password?token=${resetToken}`;
      
      const msg = {
        to,
        from: config.fromEmail,
        subject: 'Reset Your RunTribe Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: white; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #66ff00; font-size: 28px; margin: 0;">RunTribe</h1>
            </div>
            
            <div style="background-color: #2a2a2a; padding: 30px; border-radius: 10px; border: 1px solid #333;">
              <h2 style="color: white; margin-top: 0;">Hello ${userName}!</h2>
              
              <p style="color: #ccc; line-height: 1.6;">
                We received a request to reset your password for your RunTribe account. 
                If you didn't make this request, you can safely ignore this email.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #66ff00; color: black; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #ccc; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="color: #66ff00; word-break: break-all; background-color: #1a1a1a; padding: 15px; border-radius: 5px; border: 1px solid #333;">
                ${resetLink}
              </p>
              
              <p style="color: #ccc; line-height: 1.6;">
                This link will expire in 1 hour for security reasons.
              </p>
              
              <p style="color: #ccc; line-height: 1.6;">
                If you have any questions, please contact our support team.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
              <p>© 2024 RunTribe. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `
          Reset Your RunTribe Password
          
          Hello ${userName}!
          
          We received a request to reset your password for your RunTribe account. 
          If you didn't make this request, you can safely ignore this email.
          
          Click the link below to reset your password:
          ${resetLink}
          
          This link will expire in 1 hour for security reasons.
          
          If you have any questions, please contact our support team.
          
          © 2024 RunTribe. All rights reserved.
        `
      };

      // Send email based on environment
      if (config.testMode && config.localProvider === 'console') {
        // Console logging for local development
        console.log('📧 PASSWORD RESET EMAIL (Console Mode)');
        console.log('To:', to);
        console.log('Subject:', msg.subject);
        console.log('Reset Link:', resetLink);
        console.log('HTML Content:', msg.html);
        console.log('Text Content:', msg.text);
        console.log('---');
      } else if (config.provider === 'sendgrid' && config.apiKey) {
        // SendGrid for production/development
        await sgMail.send(msg);
        console.log(`✅ Password reset email sent to ${to} via SendGrid`);
      } else {
        // Fallback to console logging
        console.log('📧 PASSWORD RESET EMAIL (Fallback Mode)');
        console.log('To:', to);
        console.log('Subject:', msg.subject);
        console.log('Reset Link:', resetLink);
        console.log('---');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  },

  /**
   * Send welcome email
   * @param {string} to - Recipient email
   * @param {string} userName - User's name
   */
  async sendWelcomeEmail(to, userName) {
    try {
      const msg = {
        to,
        from: config.fromEmail,
        subject: 'Welcome to RunTribe!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: white; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #66ff00; font-size: 28px; margin: 0;">RunTribe</h1>
            </div>
            
            <div style="background-color: #2a2a2a; padding: 30px; border-radius: 10px; border: 1px solid #333;">
              <h2 style="color: white; margin-top: 0;">Welcome to RunTribe, ${userName}!</h2>
              
              <p style="color: #ccc; line-height: 1.6;">
                We're excited to have you join our running community! 
                You can now connect with other runners, join groups, and track your runs.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${config.baseUrl}/dashboard" 
                   style="background-color: #66ff00; color: black; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Get Started
                </a>
              </div>
              
              <p style="color: #ccc; line-height: 1.6;">
                Happy running!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
              <p>© 2024 RunTribe. All rights reserved.</p>
            </div>
          </div>
        `
      };

      // Send email based on environment
      if (config.testMode && config.localProvider === 'console') {
        // Console logging for local development
        console.log('📧 WELCOME EMAIL (Console Mode)');
        console.log('To:', to);
        console.log('Subject:', msg.subject);
        console.log('HTML Content:', msg.html);
        console.log('---');
      } else if (config.provider === 'sendgrid' && config.apiKey) {
        // SendGrid for production/development
        await sgMail.send(msg);
        console.log(`✅ Welcome email sent to ${to} via SendGrid`);
      } else {
        // Fallback to console logging
        console.log('📧 WELCOME EMAIL (Fallback Mode)');
        console.log('To:', to);
        console.log('Subject:', msg.subject);
        console.log('---');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }
};

export default emailService;
