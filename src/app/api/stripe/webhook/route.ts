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

        // Update user status
        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'active',
                subscriptionId: subscription.id, // Store Stripe subscription ID on user
                stripeCustomerId: customerId, // Ensure customer ID is stored/updated
            },
        });
        console.log(`[Webhook: activateSubscription] Updated user ${userId} status to active.`);

        // Create or update subscription record in DB
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
        console.log(`[Webhook: activateSubscription] Upserted subscription record for user ${userId}`);

    } catch (error) {
        console.error(`[Webhook: activateSubscription] Error during activation for ${subscriptionId}:`, error);
        // Consider how to handle errors - retry logic, logging, alerts?
        throw error; // Re-throw to indicate failure
    }
}

export async function POST(request: Request) {
  console.log('[Webhook: POST - DEBUG] Received request');
  let event: Stripe.Event;

  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('[Webhook: POST - DEBUG] Missing Stripe signature or webhook secret.');
      return NextResponse.json(
        { error: 'Webhook configuration error.' },
        { status: 400 } // Keep 400 for config errors
      );
    }
    console.log('[Webhook: POST - DEBUG] Found signature and secret. Constructing event...');

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    console.log(`[Webhook: POST - DEBUG] Event constructed successfully: ${event.type} (${event.id})`);

  } catch (err: any) {
    console.error('[Webhook: POST - DEBUG] Error constructing webhook event:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // --- TEMPORARILY BYPASS EVENT PROCESSING --- 
  console.log(`[Webhook: POST - DEBUG] Bypassing detailed processing for event type: ${event.type}. Returning 200 OK.`);
  return NextResponse.json({ received: true }, { status: 200 });

  /* // --- Original Handling Logic (Commented Out) --- 
  try {
    switch (event.type) {
      // ** Handle payment success for the FIRST invoice of a new subscription (Elements flow) **
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Webhook: invoice.payment_succeeded] Processing invoice ${invoice.id}, billing reason: ${invoice.billing_reason}`);
        
        // Check if it's the first invoice for a new subscription
        if (invoice.billing_reason === 'subscription_create') {
          const subscriptionId = invoice.subscription as string;
          const customerId = invoice.customer as string;
          
          if (!subscriptionId || !customerId) {
             console.error(`[Webhook: invoice.payment_succeeded] Missing subscriptionId or customerId on invoice ${invoice.id}`);
             break; // Or return error response
          }
          
          console.log(`[Webhook: invoice.payment_succeeded] First invoice payment for subscription ${subscriptionId}. Triggering activation.`);
          await activateSubscription(subscriptionId, customerId);
        } else {
            console.log(`[Webhook: invoice.payment_succeeded] Ignoring invoice ${invoice.id} - not for subscription creation (reason: ${invoice.billing_reason}).`);
        }
        break;
      }

      // Handle activation from the old redirect flow (optional fallback)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Webhook: checkout.session.completed] Processing session ${session.id}`);
        
        // Important: Check payment status on the session
        if (session.payment_status === 'paid') {
            const subscriptionId = session.subscription as string;
            const customerId = session.customer as string;

             if (!subscriptionId || !customerId) {
                console.error(`[Webhook: checkout.session.completed] Missing subscriptionId or customerId on session ${session.id}`);
                break; // Or return error response
             }

            console.log(`[Webhook: checkout.session.completed] Session payment successful for subscription ${subscriptionId}. Triggering activation.`);
            // We can reuse the same activation logic
            await activateSubscription(subscriptionId, customerId);
        } else {
             console.log(`[Webhook: checkout.session.completed] Ignoring session ${session.id} - payment status is ${session.payment_status}.`);
        }
        break;
      }

      // Handle subscription changes (plan change, cancellation initiated by user/API)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Webhook: customer.subscription.updated] Processing subscription ${subscription.id}, status: ${subscription.status}`);
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('[Webhook: customer.subscription.updated] Missing userId in subscription metadata');
          break;
        }
        
        const priceId = subscription.items.data[0]?.price?.id;
        if (!priceId) {
            console.error(`[Webhook: customer.subscription.updated] Missing priceId in subscription items for ${subscription.id}`);
            break;
        }
        
        // Find the package associated with the new priceId
        // This requires mapping price IDs back to your internal packages
        // You might need a more robust way if price IDs don't map clearly
        let packageId: string | undefined;
        for (const key in STRIPE_PRICE_IDS) {
            if (STRIPE_PRICE_IDS[key as keyof typeof STRIPE_PRICE_IDS] === priceId) {
                 const pkg = await prisma.package.findFirst({ where: { name: key }});
                 if(pkg) packageId = pkg.id;
                 break;
            }
        }
        
         if (!packageId) {
            console.error(`[Webhook: customer.subscription.updated] Could not map Stripe Price ID ${priceId} back to a local Package.`);
            // Decide how to handle this - maybe just update status?
        }

        // Update user's status
        await prisma.user.updateMany({
          where: { id: userId }, // Use updateMany in case user somehow has multiple entries (shouldn't happen with unique constraint)
          data: {
            subscriptionStatus: subscription.status,
            subscriptionId: subscription.id, // Ensure subscription ID is up-to-date
          },
        });

        // Update subscription record in DB
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            stripePriceId: priceId,
            packageId: packageId, // Update package if found
            // Update period end if needed
            // currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
         console.log(`[Webhook: customer.subscription.updated] Updated DB for user ${userId}, subscription ${subscription.id} to status ${subscription.status}`);
        break;
      }

      // Handle subscription cancellations (e.g., end of billing period after cancel request)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
         console.log(`[Webhook: customer.subscription.deleted] Processing deleted subscription ${subscription.id}`);
        // Note: status might be 'canceled' before it's deleted.
        // This event fires when the subscription is truly gone.
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('[Webhook: customer.subscription.deleted] Missing userId in subscription metadata');
          break;
        }

        // Update user's status to inactive
        await prisma.user.updateMany({
          where: { id: userId, stripeSubscriptionId: subscription.id }, // Be specific
          data: {
            subscriptionStatus: 'inactive',
            subscriptionId: null,
          },
        });

        // Update subscription record status in DB to canceled
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'canceled', 
          },
        });
         console.log(`[Webhook: customer.subscription.deleted] Updated DB for user ${userId}, marked subscription ${subscription.id} as canceled.`);
        break;
      }
      
       default: {
            console.log(`[Webhook: POST] Unhandled event type: ${event.type}`);
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });

  } catch (error: any) {
     // Centralized error handling for event processing
     console.error(`[Webhook: POST] Error processing event ${event?.id} (Type: ${event?.type}):`, error);
     // Optionally send error details back, but be cautious with sensitive info
     return NextResponse.json(
       { error: 'Webhook handler failed during event processing.', details: error.message },
       { status: 500 } // Use 500 for server-side processing errors
     );
  }
  */
} 