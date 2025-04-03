import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { STRIPE_PLANS, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

type PlanType = 'BASIC' | 'PRO' | 'ENTERPRISE';

export async function POST(request: Request) {
  console.log('[POST /api/stripe/checkout] Received request');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('[POST /api/stripe/checkout] Unauthorized access attempt.');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log(`[POST /api/stripe/checkout] User authenticated: ${session.user.email}`);

    const body = await request.json();
    let { plan } = body;

    console.log(`[POST /api/stripe/checkout] Received raw plan parameter: ${plan}`);

    // Normalize the plan name
    if (typeof plan === 'string') {
      const planLookupKey = plan.toUpperCase();
      // Check if the uppercase version is a direct key in STRIPE_PLANS
      if (STRIPE_PLANS[planLookupKey as PlanType]) {
        plan = planLookupKey;
        console.log(`[POST /api/stripe/checkout] Normalized plan (direct key match): ${plan}`);
      } else {
        // If not a direct key, try matching by the 'name' property within STRIPE_PLANS
        const matchedKey = Object.keys(STRIPE_PLANS).find(
          key => STRIPE_PLANS[key as PlanType].name.toLowerCase() === plan.toLowerCase()
        );
        if (matchedKey) {
          plan = matchedKey;
          console.log(`[POST /api/stripe/checkout] Normalized plan (name match): ${plan}`);
        } else {
          plan = planLookupKey; // Fallback to uppercase if no name match
          console.warn(`[POST /api/stripe/checkout] No direct key or name match found for plan '${body.plan}'. Falling back to uppercase: ${plan}. This might lead to errors if '${plan}' is not a valid key.`);
        }
      }
    } else {
      console.error(`[POST /api/stripe/checkout] Invalid plan type received: ${typeof plan}`);
      return NextResponse.json({ error: 'Invalid plan data type' }, { status: 400 });
    }

    const planKey = plan as PlanType;
    console.log(`[POST /api/stripe/checkout] Using Plan Key: ${planKey}`);

    if (!STRIPE_PLANS[planKey] || !STRIPE_PRICE_IDS[planKey]) {
      console.error(`[POST /api/stripe/checkout] Invalid or unknown plan key derived: ${planKey}. Original input: ${body.plan}. Check STRIPE_PLANS and STRIPE_PRICE_IDS.`);
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error(`[POST /api/stripe/checkout] User not found in DB for email: ${session.user.email}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    console.log(`[POST /api/stripe/checkout] Found user in DB: ${user.id}`);

    const priceId = STRIPE_PRICE_IDS[planKey];
    console.log(`[POST /api/stripe/checkout] Using Stripe Price ID: ${priceId} for Plan Key: ${planKey}`);

    if (!priceId) {
        console.error(`[POST /api/stripe/checkout] Stripe Price ID is missing for Plan Key: ${planKey}. Check STRIPE_PRICE_IDS configuration.`);
        return NextResponse.json({ error: 'Configuration error: Price ID missing for plan' }, { status: 500 });
    }

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pricing`;

    // Validate URLs
    if (!process.env.NEXT_PUBLIC_APP_URL) {
        console.error(`[POST /api/stripe/checkout] Missing NEXT_PUBLIC_APP_URL environment variable.`);
        return NextResponse.json({ error: 'Server configuration error: App URL not set.' }, { status: 500 });
    }

    console.log(`[POST /api/stripe/checkout] Creating Stripe session with Price ID: ${priceId}, Success URL: ${successUrl}, Cancel URL: ${cancelUrl}`);

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email, // Use customer_email for Stripe to find/create customer
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        plan: planKey.toLowerCase(), // Store the normalized plan key
      },
      // Optionally add automatic tax calculation if configured in Stripe
      // automatic_tax: { enabled: true },
    });

    console.log(`[POST /api/stripe/checkout] Stripe session created successfully: ${checkoutSession.id}, URL: ${checkoutSession.url}`);

    // No need for temporary 'pending' status update here if using the verify-session page
    // The webhook should handle the definitive update.
    // Optional: Could still set pending if immediate (but potentially temporary) access is desired before webhook confirmation.
    /*
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'pending',
      },
    });
    console.log(`[POST /api/stripe/checkout] User ${user.id} status set to pending.`);
    */

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error('[POST /api/stripe/checkout] Error creating checkout session:', error);

    // Log more specific Stripe error details if available
    let errorMessage = 'Failed to create checkout session';
    if (error.type) { // Check if it looks like a Stripe error object
      console.error(`[POST /api/stripe/checkout] Stripe Error Type: ${error.type}`);
      console.error(`[POST /api/stripe/checkout] Stripe Error Code: ${error.code}`);
      console.error(`[POST /api/stripe/checkout] Stripe Error Message: ${error.message}`);
      console.error(`[POST /api/stripe/checkout] Stripe Error Param: ${error.param}`);
      // Provide a more specific message based on common errors
      if (error.code === 'resource_missing' && error.param === 'line_items[0][price]') {
        errorMessage = 'Invalid Price ID. Please check Stripe configuration.';
      } else if (error.type === 'StripeAuthenticationError') {
        errorMessage = 'Stripe authentication failed. Check your secret key.';
      } else if (error.code === 'parameter_invalid_string' && error.param === 'success_url') {
        errorMessage = 'Invalid Success URL format. Check NEXT_PUBLIC_APP_URL.';
      }
      // You can add more specific error checks here based on Stripe error codes
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message }, // Return the potentially more specific message
      { status: 500 }
    );
  }
} 