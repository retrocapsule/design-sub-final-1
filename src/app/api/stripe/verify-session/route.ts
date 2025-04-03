import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe'; // Assuming your stripe client is initialized here

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Basic check: Ensure the session exists and check its status
    if (!session) {
        return NextResponse.json({ verified: false, error: 'Session not found.' }, { status: 404 });
    }

    // Return the verification status and session status
    // The frontend can use session.status to decide the next steps
    // 'complete' means payment succeeded.
    // 'open' means the checkout page is still active or processing.
    // 'expired' means the session timed out.
    return NextResponse.json({
        verified: session.status === 'complete',
        status: session.status,
        // Optionally return customer email or other relevant details if needed
        // customer_email: session.customer_details?.email
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error verifying Stripe session:', error);

    // Handle specific Stripe errors if necessary
    // e.g., if (error.type === 'StripeInvalidRequestError') { ... }

    return NextResponse.json(
      { error: 'Failed to verify session', details: error.message },
      { status: 500 }
    );
  }
} 