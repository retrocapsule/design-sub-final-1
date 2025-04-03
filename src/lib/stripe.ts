import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_PLANS = {
  BASIC: {
    name: 'Basic',
    price: 99,
    originalPrice: 199,
    features: [
      'Unlimited design requests',
      'Unlimited revisions',
      '48-hour turnaround',
      '1 active request at a time',
      'Source files included',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 199,
    originalPrice: 399,
    features: [
      'Unlimited design requests',
      'Unlimited revisions',
      '24-hour turnaround',
      '2 active requests at a time',
      'Source files included',
      'Dedicated project manager',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 499,
    originalPrice: 999,
    features: [
      'Unlimited design requests',
      'Unlimited revisions',
      '24-hour turnaround',
      '5 active requests at a time',
      'Source files included',
      'Dedicated design team',
    ],
  },
};

export const STRIPE_PRODUCT_IDS = {
  BASIC: process.env.STRIPE_BASIC_PRODUCT_ID || 'prod_basic',
  PRO: process.env.STRIPE_PRO_PRODUCT_ID || 'prod_pro',
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRODUCT_ID || 'prod_enterprise',
};

export const STRIPE_PRICE_IDS = {
  BASIC: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
  PRO: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
};

// Helper function to create a checkout session
export async function createCheckoutSession({
  customerId,
  priceId,
  returnUrl,
}: {
  customerId: string;
  priceId: string;
  returnUrl: string;
}) {
  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${returnUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}/canceled`,
  });

  return session;
}

// Helper function to get customer portal session
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Helper function to get a subscription by ID
export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

// Helper function to cancel a subscription
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

// Helper function to update a subscription
export async function updateSubscription({
  subscriptionId,
  priceId,
}: {
  subscriptionId: string;
  priceId: string;
}) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Update the price for the subscription
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  });
  
  return updatedSubscription;
}

// Map Stripe plan IDs to our plan types
export function getPlanNameFromPriceId(priceId: string): string {
  switch (priceId) {
    case STRIPE_PRICE_IDS.BASIC:
      return STRIPE_PLANS.BASIC.name;
    case STRIPE_PRICE_IDS.PRO:
      return STRIPE_PLANS.PRO.name;
    case STRIPE_PRICE_IDS.ENTERPRISE:
      return STRIPE_PLANS.ENTERPRISE.name;
    default:
      return 'Unknown';
  }
} 