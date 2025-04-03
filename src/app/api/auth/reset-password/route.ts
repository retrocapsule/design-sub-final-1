import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    // Validate password length (optional but good practice)
    if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // 1. Find the user by the reset token
    // TODO: If token was hashed before storing, find by hashed token instead
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
    });

    // 2. Check if user exists and token is not expired
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Salt rounds = 10

    // 4. Update the user's password and clear the reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null, // Clear the token
        passwordResetExpires: null, // Clear the expiry date
      },
    });

     console.log(`Password successfully reset for user: ${user.email}`);

    // 5. Return success response
    return NextResponse.json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 