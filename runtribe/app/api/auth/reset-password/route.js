import { NextResponse } from 'next/server';
import { resetTokens } from '../forgot-password/route';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get token data
    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (tokenData.expiresAt < new Date()) {
      resetTokens.delete(token);
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (tokenData.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      );
    }

    // Hash the new password (in production, use bcrypt)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // TODO: Update user password in database
    // await updateUserPassword(tokenData.email, hashedPassword);

    // Mark token as used
    tokenData.used = true;
    resetTokens.set(token, tokenData);

    // Clean up expired tokens
    cleanupExpiredTokens();

    return NextResponse.json({
      message: 'Password has been successfully reset'
    });

  } catch (error) {
    console.error('Reset password error:', error);
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

