import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;
    
    console.log('Test checkout with plan:', plan);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the package by name (case insensitive)
    const packageData = await prisma.package.findFirst({
      where: {
        name: plan
      },
    });

    if (!packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Update user subscription status directly
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'active',
        // Use a fake subscription ID for testing
        subscriptionId: `test_sub_${Date.now()}`,
      },
    });

    // Create or update subscription record
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });
    
    if (existingSubscription) {
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          packageId: packageData.id,
          status: 'active',
        }
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          packageId: packageData.id,
          status: 'active',
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      redirect: '/onboarding'
    });
  } catch (error) {
    console.error('Error in test checkout:', error);
    return NextResponse.json(
      { error: 'Test checkout failed' },
      { status: 500 }
    );
  }
} 