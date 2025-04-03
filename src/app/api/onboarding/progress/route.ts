import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { step } = await req.json();

    // Update user's onboarding progress
    await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        onboardingStep: step,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving onboarding progress:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 