import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

// Initialize Resend with proper error handling
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey && process.env.NODE_ENV === 'production') {
  console.error('RESEND_API_KEY is missing in production environment');
}
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. If user exists, generate token, save it, and send email
    if (user) {
      // Generate a secure token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetToken = resetToken;

      // Set expiration time (e.g., 1 hour from now)
      const passwordResetExpires = new Date(Date.now() + 3600000);

      // Update user record with token and expiry
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken,
          passwordResetExpires,
        },
      });

      // Construct the reset link
      const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

      // Send the email using Resend if available, otherwise log it
      if (resend) {
        try {
          await resend.emails.send({
            from: 'noreply@yourdomain.com',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
              <h1>Password Reset Request</h1>
              <p>You requested a password reset. Click the link below to reset your password:</p>
              <p><a href="${resetLink}">Reset Password</a></p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            `,
          });
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
          return NextResponse.json(
            { error: 'Failed to send password reset email' },
            { status: 500 }
          );
        }
      } else {
        // In development or if Resend is not configured, log the reset link
        console.log('Password reset link (development only):', resetLink);
      }

      return NextResponse.json({ message: 'Password reset email sent' });
    }

    // Always return success even if user doesn't exist (security through obscurity)
    return NextResponse.json({ message: 'If an account exists, a password reset email has been sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 