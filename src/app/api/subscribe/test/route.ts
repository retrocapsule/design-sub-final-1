import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// Change GET to POST and accept request object
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Read packageId from the request body
    let packageId: string;
    try {
      const body = await request.json();
      packageId = body.packageId;
      if (!packageId) {
        throw new Error('Missing packageId in request body');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error instanceof Error ? error.message : 'Failed to parse JSON' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user already has an active subscription, return it
    if (user.subscription && user.subscription.status === 'active') {
      return NextResponse.json({
        message: 'User already has an active subscription',
        subscription: user.subscription,
        redirectTo: '/dashboard' // Always redirect to dashboard if already subscribed
      });
    }

    // Generate a unique subscription ID
    const uniqueSubscriptionId = `test_subscription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Find the selected package using the provided packageId
      const selectedPackage = await tx.package.findUnique({
        where: { id: packageId }
      });

      if (!selectedPackage) {
        // Throw an error that will be caught by the outer try...catch
        throw new Error(`Package with ID ${packageId} not found`);
      }

      // Create or update subscription using the found package
      const subscription = await tx.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: 'active',
          packageId: selectedPackage.id, // Use found package ID
          stripePriceId: `test_price_${selectedPackage.id}`,
          stripeSubscriptionId: uniqueSubscriptionId
        },
        create: {
          userId: user.id,
          packageId: selectedPackage.id, // Use found package ID
          status: 'active',
          stripePriceId: `test_price_${selectedPackage.id}`,
          stripeSubscriptionId: uniqueSubscriptionId
        }
      });

      // Update user's subscription status
      await tx.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'active',
          subscriptionId: uniqueSubscriptionId,
          // Optionally generate a test customer ID if needed elsewhere
          // stripeCustomerId: user.stripeCustomerId || `test_customer_${Date.now()}` 
        }
      });

      return { subscription, selectedPackage };
    });

    // Create a new response
    const response = NextResponse.json({
      message: 'Test subscription created successfully',
      subscription: result.subscription,
      redirectTo: '/dashboard' // Redirect to dashboard after successful test subscription
    });

    // No need to manually update session token here, 
    // next-auth should handle session updates automatically based on database changes
    // if configured correctly in authOptions callbacks.

    return response;
  } catch (error) {
    console.error('Error creating test subscription:', error);
    // Return a more detailed error message
    return NextResponse.json(
      { 
        error: 'Failed to create test subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 