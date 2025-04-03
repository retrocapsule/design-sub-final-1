import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
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
      // TODO: Consider hashing the token before storing for extra security
      // const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const passwordResetToken = resetToken; // Storing unhashed for simplicity now

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

      // Send the email using Resend
      try {
        await resend.emails.send({
          from: 'noreply@yourdomain.com', // IMPORTANT: Replace with your verified sending domain in Resend
          to: user.email,
          subject: 'Reset Your Password',
          html: `
            <p>You requested a password reset.</p>
            <p>Click the link below to set a new password. This link will expire in 1 hour:</p>
            <a href="${resetLink}" target="_blank">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
          `,
        });
         console.log(`Password reset email sent successfully to ${user.email}`);
      } catch (emailError) {
        console.error('Resend Error:', emailError);
        // Don't throw error to user, but log it. The generic success message is still sent.
        // Consider adding more robust error handling/monitoring here.
      }
    }
     else {
       console.log(`Password reset request for non-existent email: ${email}`);
     }

    // 3. Always return a generic success response to prevent email enumeration
    return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('Request Password Reset Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 