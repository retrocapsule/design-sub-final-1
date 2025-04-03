'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Shield, CheckCircle2, ArrowRight, Info, LockIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// ** NEW STRIPE IMPORTS **
import { loadStripe, StripeError } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/checkout/checkout-form';

interface Package {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  features: any;  // JSON type from Prisma
  isActive: boolean;
}

// ** INITIALIZE STRIPE OUTSIDE COMPONENT **
// Ensure NEXT_PUBLIC_STRIPE_PUBLIC_KEY is set in your .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

// Wrapper component to handle search params
function CheckoutContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get('package');
  
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm packageId={packageId} />
    </Elements>
  );
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
} 