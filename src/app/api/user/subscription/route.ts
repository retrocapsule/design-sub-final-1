import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user with subscription data
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        subscription: {
          include: {
            package: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has an active subscription
    const hasActiveSubscription = 
      user.subscriptionStatus === 'active' || 
      user.subscriptionStatus === 'pending' ||
      (user.subscription && 
       (user.subscription.status === 'active' || 
        user.subscription.status === 'pending'));

    return NextResponse.json({
      hasActiveSubscription,
      subscriptionStatus: user.subscriptionStatus,
      subscription: user.subscription ? {
        id: user.subscription.id,
        status: user.subscription.status,
        packageName: user.subscription.package?.name || 'Unknown',
        packageId: user.subscription.packageId
      } : null
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
} 