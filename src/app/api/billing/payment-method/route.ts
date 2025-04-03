import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the customer's payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: session.user.stripeCustomerId as string,
      type: 'card',
    });

    return NextResponse.json(
      paymentMethods.data.map(method => ({
        id: method.id,
        brand: method.card?.brand,
        last4: method.card?.last4,
        expMonth: method.card?.exp_month,
        expYear: method.card?.exp_year,
        isDefault: method.id === session.user.defaultPaymentMethodId,
      }))
    );
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { message: 'Error fetching payment methods' },
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

    // Create a Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: session.user.stripeCustomerId as string,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { message: 'Error creating portal session' },
      { status: 500 }
    );
  }
} 