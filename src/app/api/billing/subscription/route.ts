import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the user with subscription data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if this is a test subscription
    if (user.subscriptionId && user.subscriptionId.startsWith('test_')) {
      return NextResponse.json({
        id: user.subscriptionId,
        plan: 'Test Package',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        price: 49,
        interval: 'monthly',
        cancelAtPeriodEnd: false,
      });
    }

    // If not a test subscription, get from Stripe
    if (!user.subscriptionId) {
      return NextResponse.json({ message: 'No subscription found' }, { status: 404 });
    }

    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);

    return NextResponse.json({
      id: subscription.id,
      plan: subscription.items.data[0].price.product,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      price: subscription.items.data[0].price.unit_amount ? 
        subscription.items.data[0].price.unit_amount / 100 : 0,
      interval: subscription.items.data[0].price.recurring?.interval,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { message: 'Error fetching subscription' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    // Get the user to check subscription type
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (action === 'cancel') {
      // Handle test subscription cancellation
      if (user.subscriptionId && user.subscriptionId.startsWith('test_')) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'cancelled',
            subscription: {
              update: {
                status: 'cancelled'
              }
            }
          }
        });

        return NextResponse.json({
          message: 'Test subscription cancelled successfully',
          subscription: {
            id: user.subscriptionId,
            status: 'cancelled',
            cancelAtPeriodEnd: true
          }
        });
      }

      // Handle Stripe subscription cancellation
      if (!user.subscriptionId) {
        return NextResponse.json({ message: 'No subscription found' }, { status: 404 });
      }

      const subscription = await stripe.subscriptions.update(
        user.subscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      return NextResponse.json({
        message: 'Subscription cancelled successfully',
        subscription,
      });
    }

    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      { message: 'Error managing subscription' },
      { status: 500 }
    );
  }
} 