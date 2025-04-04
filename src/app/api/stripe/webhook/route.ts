import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type { Stripe } from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function activateSubscription(subscriptionId: string, customerId: string) {
    console.log(`[Webhook: activateSubscription] Activating subscription ${subscriptionId} for customer ${customerId}`);
    try {
        // Retrieve the subscription to get metadata and price info
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price'] // Ensure we get price details
        });

        const userId = subscription.metadata?.userId;
        const planId = subscription.metadata?.planId;
        const priceId = subscription.items.data[0]?.price?.id;

        if (!userId) {
            console.error(`[Webhook: activateSubscription] Missing userId in metadata for subscription ${subscriptionId}`);
            throw new Error('Missing userId in subscription metadata');
        }
        if (!planId) {
            console.error(`[Webhook: activateSubscription] Missing planId in metadata for subscription ${subscriptionId}`);
            throw new Error('Missing planId in subscription metadata');
        }
         if (!priceId) {
            console.error(`[Webhook: activateSubscription] Missing priceId in subscription items for ${subscriptionId}`);
            throw new Error('Missing priceId in subscription items');
        }

        console.log(`[Webhook: activateSubscription] Found metadata: userId=${userId}, planId=${planId}, priceId=${priceId}`);

        // Verify package exists in DB
        const packageData = await prisma.package.findUnique({
             where: { id: planId }
        });
        if (!packageData) {
            console.error(`[Webhook: activateSubscription] Package not found in DB for ID: ${planId}`);
            throw new Error(`Package not found for ID: ${planId}`);
        }

        // --- Enhanced User Update --- 
        console.log(`[Webhook: activateSubscription] Attempting to update User record with ID: ${userId}`);
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: 'active',
                    subscriptionId: subscription.id, // Store Stripe subscription ID on user
                    stripeCustomerId: customerId, // Ensure customer ID is stored/updated
                },
            });
            console.log(`[Webhook: activateSubscription] Successfully updated User record for ID: ${userId}. Status set to: ${updatedUser.subscriptionStatus}`);
        } catch (userUpdateError) {
            console.error(`[Webhook: activateSubscription] FAILED to update User record for ID: ${userId}. Error:`, userUpdateError);
            // Decide if this should prevent the subscription upsert or just be logged.
            // For now, we'll log and continue, but this indicates a potential data mismatch.
        }

        // --- Subscription Upsert --- 
        console.log(`[Webhook: activateSubscription] Attempting to upsert Subscription record for user ID: ${userId}`);
        await prisma.subscription.upsert({
            where: { userId: userId }, // Assuming one active subscription per user
            create: {
                userId: userId,
                packageId: planId,
                status: 'active', // Use subscription.status from Stripe? Could be 'trialing' etc.
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
                // Add current_period_end, start_date etc. if needed from subscription object
                // currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
                packageId: planId,
                status: 'active', // Or subscription.status
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
                // currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        });
        console.log(`[Webhook: activateSubscription] Successfully upserted Subscription record for user ID: ${userId}`);

    } catch (error) {
        console.error(`[Webhook: activateSubscription] Error during activation for ${subscriptionId}:`, error);
        // Consider how to handle errors - retry logic, logging, alerts?
        throw error; // Re-throw to indicate failure
    }
}

async function deactivateSubscription(subscription: Stripe.Subscription) {
  console.log('[Webhook: deactivateSubscription] Deactivating subscription:', subscription.id);
  try {
    await prisma.user.update({
      where: {
        subscriptionId: subscription.id,
      },
      data: {
        subscriptionStatus: 'inactive', // Or map from subscription.status
      },
    });
    console.log('[Webhook: deactivateSubscription] User subscription status updated to inactive in DB for subscription:', subscription.id);
  } catch (error) {
    console.error('[Webhook: deactivateSubscription] Error updating user subscription status:', error);
  }
}

export async function POST(request: Request) {
  console.log('[Webhook: POST] Received request');
  let event: Stripe.Event;

  if (!webhookSecret) {
    console.error('[Webhook: POST] STRIPE_WEBHOOK_SECRET not set in environment variables.');
    return NextResponse.json({ error: 'Webhook secret is not configured.' }, { status: 500 });
  }

  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[Webhook: POST] Missing Stripe signature.');
      return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
    }
    console.log('[Webhook: POST] Found signature and secret. Constructing event...');

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    console.log(`[Webhook: POST] Event constructed successfully: ${event.type} (${event.id})`);

  } catch (err: any) {
    console.error('[Webhook: POST] Error constructing webhook event:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // --- Handle Specific Events --- 
  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Webhook: POST] Handling invoice.payment_succeeded for invoice: ${invoice.id}`);
        // Check if it's for a subscription
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await activateSubscription(invoice.subscription as string, invoice.customer as string);
        } else {
            console.log('[Webhook: POST] Invoice payment succeeded, but not for a subscription.');
        }
        break;
      }

      case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(`[Webhook: POST] Handling checkout.session.completed for session: ${session.id}`);
          // This often fires *before* invoice.payment_succeeded for the initial sub creation
          // You might activate here, or rely on invoice.payment_succeeded
          if (session.mode === 'subscription' && session.subscription) {
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
              await activateSubscription(session.subscription as string, session.customer as string);
          } else {
              console.log('[Webhook: POST] Checkout session completed, but not for a subscription mode or missing subscription ID.');
          }
          break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Webhook: POST] Handling customer.subscription.updated for subscription: ${subscription.id}, Status: ${subscription.status}`);
        // Handle changes like plan upgrades/downgrades or status changes (e.g., past_due)
        if (subscription.status === 'active') {
          await activateSubscription(subscription.id, subscription.customer as string);
        } else {
          // Handle other statuses if needed (e.g., past_due, unpaid, canceled)
          // For simplicity, we might just rely on deleted for full deactivation
           console.log(`[Webhook: POST] Subscription status is ${subscription.status}, not activating.`);
           // Consider adding specific logic for 'canceled', 'past_due' etc. if needed.
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Webhook: POST] Handling customer.subscription.deleted for subscription: ${subscription.id}`);
        // Sent when a subscription is canceled or ends
        await deactivateSubscription(subscription);
        break;
      }

      default:
        console.log(`[Webhook: POST] Unhandled event type ${event.type}`);
    }

    // Return success after handling (or ignoring) the event
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error(`[Webhook: POST] Error handling event ${event.type}:`, error);
    // Return 500 if error during actual processing
    return NextResponse.json({ error: 'Webhook handler failed processing event.' }, { status: 500 });
  }
} 