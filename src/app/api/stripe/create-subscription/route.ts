import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { STRIPE_PRICE_IDS } from '@/lib/stripe'; // Assuming you map Plan Names/Keys to Price IDs here
import { prisma } from '@/lib/prisma';
import type { Stripe } from 'stripe';

type PlanType = keyof typeof STRIPE_PRICE_IDS; // e.g., 'BASIC' | 'PRO' | 'ENTERPRISE'

export async function POST(request: Request) {
  console.log('[POST /api/stripe/create-subscription] Received request');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('[POST /api/stripe/create-subscription] Unauthorized access attempt.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log(`[POST /api/stripe/create-subscription] User authenticated: ${session.user.email}`);

    const body = await request.json();
    const { planId } = body; // Frontend sends the database Package ID

    if (!planId) {
      console.error('[POST /api/stripe/create-subscription] Missing planId in request body.');
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }
    console.log(`[POST /api/stripe/create-subscription] Received Plan ID: ${planId}`);

    // 1. Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error(`[POST /api/stripe/create-subscription] User not found in DB for email: ${session.user.email}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log(`[POST /api/stripe/create-subscription] Found user in DB: ${user.id}`);

    // 2. Fetch package details from DB using planId
    const selectedPackage = await prisma.package.findUnique({
        where: { id: planId }
    });

    if (!selectedPackage) {
        console.error(`[POST /api/stripe/create-subscription] Package not found in DB for ID: ${planId}`);
        return NextResponse.json({ error: 'Selected plan not found.'}, { status: 404 });
    }
    console.log(`[POST /api/stripe/create-subscription] Found package: ${selectedPackage.name} (ID: ${selectedPackage.id})`);

    // 3. Get the corresponding Stripe Price ID (Requires mapping in STRIPE_PRICE_IDS)
    // **IMPORTANT**: Ensure STRIPE_PRICE_IDS keys match the package names or a derivable key
    const planKey = selectedPackage.name.toUpperCase() as PlanType; // Assuming plan names like 'Basic', 'Pro' map to keys 'BASIC', 'PRO'
    const priceId = STRIPE_PRICE_IDS[planKey];

    if (!priceId) {
        console.error(`[POST /api/stripe/create-subscription] Stripe Price ID not found for Plan Key: ${planKey} (derived from Package Name: ${selectedPackage.name}). Check STRIPE_PRICE_IDS configuration.`);
        return NextResponse.json({ error: 'Configuration error: Price ID missing for selected plan.' }, { status: 500 });
    }
    console.log(`[POST /api/stripe/create-subscription] Using Stripe Price ID: ${priceId} for Plan Key: ${planKey}`);

    // 4. Find or Create Stripe Customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      console.log(`[POST /api/stripe/create-subscription] Stripe Customer ID not found for user ${user.id}. Creating new Stripe Customer.`);
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined, // Optional: pass user's name
          metadata: {
            userId: user.id,
          },
        });
        stripeCustomerId = customer.id;
        console.log(`[POST /api/stripe/create-subscription] Created Stripe Customer: ${stripeCustomerId}`);

        // Update user record in DB with the new Stripe Customer ID
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: stripeCustomerId },
        });
        console.log(`[POST /api/stripe/create-subscription] Updated user ${user.id} with Stripe Customer ID.`);
      } catch (customerError: any) {
         console.error('[POST /api/stripe/create-subscription] Error creating Stripe customer:', customerError);
         return NextResponse.json({ error: 'Failed to create customer record for payment.', details: customerError.message }, { status: 500 });
      }
    } else {
      console.log(`[POST /api/stripe/create-subscription] Found existing Stripe Customer ID: ${stripeCustomerId} for user ${user.id}.`);
    }

    // 5. Create the Stripe Subscription
    console.log(`[POST /api/stripe/create-subscription] Creating Stripe Subscription for Customer ${stripeCustomerId} with Price ${priceId}`);
    let subscription: Stripe.Subscription;
    try {
         subscription = await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete', // Crucial: Creates subscription but requires payment confirmation
            payment_settings: { save_default_payment_method: 'on_subscription' }, // Save card for future renewals
            expand: ['latest_invoice.payment_intent'], // Expand to get the Payment Intent for the initial invoice
            metadata: { // Optional: Add metadata for easier tracking
                userId: user.id,
                planId: selectedPackage.id,
                planName: selectedPackage.name
            }
        });
         console.log(`[POST /api/stripe/create-subscription] Created Stripe Subscription: ${subscription.id}, Status: ${subscription.status}`);

    } catch (subError: any) {
        console.error('[POST /api/stripe/create-subscription] Error creating Stripe subscription:', subError);
        return NextResponse.json({ error: 'Failed to create subscription.', details: subError.message }, { status: 500 });
    }

    // 6. Extract the client secret from the Payment Intent associated with the subscription's first invoice
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    if (!paymentIntent?.client_secret) {
       console.error(`[POST /api/stripe/create-subscription] Could not extract client_secret from subscription ${subscription.id}. Payment Intent status: ${paymentIntent?.status}`);
       return NextResponse.json({ error: 'Could not initialize payment process.' }, { status: 500 });
    }

    console.log(`[POST /api/stripe/create-subscription] Successfully created subscription ${subscription.id} and retrieved client_secret.`);

    // 7. Return the client secret and subscription ID to the frontend
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
    });

  } catch (error: any) {
    console.error('[POST /api/stripe/create-subscription] General error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription', details: error.message },
      { status: 500 }
    );
  }
} 