import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type { Stripe } from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function activateSubscription(subscriptionId: string, customerId: string) {
    console.error(`>>> activateSubscription START for SubID: ${subscriptionId}, CustID: ${customerId}`);
    try {
        console.error(`>>> activateSubscription: Attempting stripe.subscriptions.retrieve(${subscriptionId})`);
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (!subscription) {
            console.error(`>>> activateSubscription: FAILED stripe.subscriptions.retrieve(${subscriptionId}) - Subscription not found.`);
            return; // Exit if subscription not found
        }
        console.error(`>>> activateSubscription: Retrieved Subscription ${subscription.id}, Status: ${subscription.status}`);

        const userId = subscription.metadata?.userId;
        const planId = subscription.metadata?.planId; // Assuming you store planId here
        const priceId = subscription.items.data[0]?.price?.id;

        if (!userId) {
            console.error(`>>> activateSubscription: FAILED - Missing userId in metadata for subscription ${subscriptionId}`);
            return; // Cannot proceed without userId
        }
         console.error(`>>> activateSubscription: Found userId in metadata: ${userId}`);
        // Add checks/logging for planId/priceId if needed...

        // Find the corresponding package in your DB
        console.error(`>>> activateSubscription: Attempting prisma.package.findUnique for planId: ${planId}`);
        const packageData = await prisma.package.findUnique({ where: { id: planId } });

        if (!packageData) {
            console.error(`>>> activateSubscription: FAILED - Could not find Package in DB corresponding to planId: ${planId}`);
            return; // Cannot proceed without matching package
        }
        console.error(`>>> activateSubscription: Found matching Package: ${packageData.name} (ID: ${packageData.id})`);

        // --- Enhanced User Update --- 
        console.error(`>>> activateSubscription: PRE-UPDATE User record for ID: ${userId}`);
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: 'active', // Explicitly setting to active
                    subscriptionId: subscription.id,
                    stripeCustomerId: customerId,
                },
            });
            // Log the actual status returned after the update
            console.error(`>>> activateSubscription: POST-UPDATE User successful for ID: ${userId}. Returned Status: ${updatedUser?.subscriptionStatus}`);
        } catch (userUpdateError) {
            console.error(`>>> activateSubscription: FAILED during prisma.user.update for ID: ${userId}. Error:`, userUpdateError);
            // Continue to upsert subscription even if user update failed? Maybe not.
            return; // Exit if user update fails, as access relies on it.
        }

        // --- Subscription Upsert --- 
         console.error(`>>> activateSubscription: PRE-UPSERT Subscription record for user ID: ${userId}`);
        await prisma.subscription.upsert({
             where: { userId: userId },
             update: {
                packageId: packageData.id,
                status: subscription.status,
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
             },
             create: {
                // id: subscription.id, // Prisma typically auto-generates IDs unless specified otherwise
                userId: userId,
                packageId: packageData.id,
                status: subscription.status,
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
             },
         });
        console.error(`>>> activateSubscription: POST-UPSERT Subscription successful for user ID: ${userId}`);

    } catch (error) {
        console.error(`>>> activateSubscription: FAILED - Outer catch block error for SubID ${subscriptionId}:`, error);
    }
    console.error(`>>> activateSubscription END for SubID: ${subscriptionId}`);
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
        // Add detailed logging for the invoice object
        console.log(`[Webhook: POST] Handling invoice.payment_succeeded for invoice: ${invoice.id}. Full Invoice Object:`, JSON.stringify(invoice, null, 2));

        // Check if it's for a subscription
        if (invoice.subscription) {
           console.log(`[Webhook: POST] Invoice ${invoice.id} IS associated with subscription: ${invoice.subscription}. Activating.`);
           // Pass the subscription ID and customer ID
           await activateSubscription(invoice.subscription as string, invoice.customer as string);
        } else {
           console.log(`[Webhook: POST] Invoice ${invoice.id} is NOT associated with a subscription (invoice.subscription is null or empty).`);
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

      case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`[Webhook: POST] Handling customer.subscription.created for subscription: ${subscription.id}, Status: ${subscription.status}`);
          // Directly activate using the subscription object details
          // Ensure customer ID is correctly passed (it's on the subscription object)
          if (subscription.customer) {
              await activateSubscription(subscription.id, subscription.customer as string);
          } else {
              console.error(`[Webhook: POST] customer.subscription.created event is missing customer ID for subscription ${subscription.id}`);
          }
          break;
      }

      case 'customer.subscription.updated': {
           // ... existing logic ...
            // Make sure activateSubscription call passes correct arguments
           const subscription = event.data.object as Stripe.Subscription;
           if (subscription.status === 'active' && subscription.customer) {
               await activateSubscription(subscription.id, subscription.customer as string);
           } else {
               console.log(`[Webhook: POST] Subscription ${subscription.id} status is ${subscription.status} or customer is missing, not activating via update.`);
               // Handle other statuses if needed
           }
            break;
      }

      case 'customer.subscription.deleted': {
           // ... existing logic ...
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