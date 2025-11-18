import { NextResponse } from 'next/server';
import { emailService } from '../../../../services/emailService';
import crypto from 'crypto';

// In-memory storage for reset tokens (in production, use a database)
const resetTokens = new Map();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store the token (in production, save to database)
    resetTokens.set(resetToken, {
      email,
      expiresAt,
      used: false
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
      
      // Clean up expired tokens
      cleanupExpiredTokens();
      
      return NextResponse.json({
        message: 'If an account with that email exists, we\'ve sent you a password reset link.'
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // Remove the token if email failed
      resetTokens.delete(resetToken);
      
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again later.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clean up expired tokens
function cleanupExpiredTokens() {
  const now = new Date();
  for (const [token, data] of resetTokens.entries()) {
    if (data.expiresAt < now || data.used) {
      resetTokens.delete(token);
    }
  }
}

// Export for testing purposes
export { resetTokens };

