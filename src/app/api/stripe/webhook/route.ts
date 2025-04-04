import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type { Stripe } from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function activateSubscription(subscriptionId: string, customerId: string) {
    console.log(`[Webhook: activateSubscription] Activating subscription ${subscriptionId} for customer ${customerId}`);
    try {
        // Retrieve the full subscription object from Stripe using the ID
        // This ensures we have the latest details and metadata
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (!subscription) {
            console.error(`[Webhook: activateSubscription] Could not retrieve subscription ${subscriptionId} from Stripe.`);
            return; // Exit if subscription not found
        }

        const userId = subscription.metadata?.userId;
        const planId = subscription.metadata?.planId; // Assuming you store planId here
        const priceId = subscription.items.data[0]?.price?.id;

        if (!userId) {
            console.error(`[Webhook: activateSubscription] Missing userId in metadata for subscription ${subscriptionId}`);
            return; // Cannot proceed without userId
        }
        if (!planId || !priceId) {
             console.error(`[Webhook: activateSubscription] Missing planId or priceId in metadata/items for subscription ${subscriptionId}`);
             // Decide if you still want to activate partially
             // return;
        }

        console.log(`[Webhook: activateSubscription] Retrieved Subscription ${subscription.id}, Status: ${subscription.status}. Metadata: userId=${userId}, planId=${planId}. PriceId: ${priceId}`);

        // Find the corresponding package in your DB using the planId from metadata OR priceId
        // Using planId from metadata might be safer if price IDs can change
        const packageData = await prisma.package.findUnique({ where: { id: planId } });
        // Fallback or primary lookup using priceId if needed:
        // const packageData = await prisma.package.findUnique({ where: { stripePriceId: priceId } });

        if (!packageData) {
            console.error(`[Webhook: activateSubscription] Could not find Package in DB corresponding to planId: ${planId} (or priceId: ${priceId})`);
            return; // Cannot proceed without matching package
        }
        console.log(`[Webhook: activateSubscription] Found matching Package: ${packageData.name} (ID: ${packageData.id})`);

        // --- Enhanced User Update --- 
        console.log(`[Webhook: activateSubscription] Attempting to update User record with ID: ${userId}`);
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: 'active', // Use 'active' or map from subscription.status
                    subscriptionId: subscription.id, // Store Stripe subscription ID on user
                    stripeCustomerId: customerId, // Ensure customer ID is stored/updated
                },
            });
            console.log(`[Webhook: activateSubscription] Successfully updated User record for ID: ${userId}. Status set to: ${updatedUser.subscriptionStatus}`);
        } catch (userUpdateError) {
            console.error(`[Webhook: activateSubscription] FAILED to update User record for ID: ${userId}. Error:`, userUpdateError);
        }

        // --- Subscription Upsert --- 
        console.log(`[Webhook: activateSubscription] Attempting to upsert Subscription record for user ID: ${userId}`);
        await prisma.subscription.upsert({
             where: { userId: userId },
             update: {
                packageId: packageData.id,
                status: subscription.status, // Use status from retrieved subscription
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId, // Store the actual price ID
             },
             create: {
                id: subscription.id, // Use stripe subscription id as primary key maybe?
                userId: userId,
                packageId: packageData.id,
                status: subscription.status,
                stripeSubscriptionId: subscription.id,
                stripePriceId: priceId,
             },
         });
        console.log(`[Webhook: activateSubscription] Successfully upserted Subscription record for user ID: ${userId}`);

    } catch (error) {
        console.error(`[Webhook: activateSubscription] Error during activation process for subscription ${subscriptionId}:`, error);
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