'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, ArrowRight, LockIcon } from 'lucide-react';

// Ensure NEXT_PUBLIC_STRIPE_PUBLIC_KEY is set in your .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

interface CheckoutFormProps {
  packageId: string | null;
}

export function CheckoutForm({ packageId }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { data: session } = useSession();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!packageId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No package selected. Please select a package to continue.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/pricing')}
        >
          View Packages
        </Button>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe.js has not loaded yet. Please wait a moment and try again.");
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card details component not found. Please refresh the page.");
      setProcessing(false);
      return;
    }

    try {
      // 1. Call backend to create subscription and get client secret
      const createSubResponse = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: packageId }),
      });

      const subData = await createSubResponse.json();

      if (!createSubResponse.ok || !subData.clientSecret) {
        throw new Error(subData.error || 'Failed to initialize payment.');
      }

      const { clientSecret, subscriptionId } = subData;

      // 2. Confirm the card payment with the client secret
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: session?.user?.name,
            email: session?.user?.email,
          },
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message || 'An unexpected payment error occurred.');
        toast.error(paymentResult.error.message || 'Payment failed.');
        setProcessing(false);
      } else {
        toast.success('Payment successful! Your subscription is being activated.');
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error('Subscription/Payment error:', err);
      const message = err.message || 'An unexpected error occurred.';
      setError(message);
      toast.error(message);
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    },
    hidePostalCode: true
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-1">
          Credit or debit card
        </Label>
        <div className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-3 bg-white">
          <CardElement id="card-element" options={cardElementOptions} />
        </div>
      </div>
      {error && (
        <div className="text-red-600 text-sm flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1" /> {error}
        </div>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Complete Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      <div className="flex items-center justify-center text-xs text-muted-foreground mt-2">
        <LockIcon className="h-3 w-3 mr-1" /> Secure payment powered by Stripe
      </div>
    </form>
  );
} 