import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Fallback for local dev

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
      const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour in ms

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

      // Send the email using our email service
      const emailResult = await sendEmail({
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

      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error);
        return NextResponse.json(
          { error: 'Failed to send password reset email' },
          { status: 500 }
        );
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