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
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  features: string[];
  isActive: boolean;
  stripePriceId?: string | null;
}

// ** INITIALIZE STRIPE OUTSIDE COMPONENT **
// Ensure NEXT_PUBLIC_STRIPE_PUBLIC_KEY is set in your .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

// Wrapper component to handle search params and fetch package ID
function CheckoutContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get('plan'); // Get plan NAME from URL

  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all packages on mount
  useEffect(() => {
    const loadPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/packages');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const fetchedPackages: Package[] = await response.json();
        // Ensure features is always an array of strings if needed
        const processedPackages = fetchedPackages.map(pkg => ({
          ...pkg,
          features: Array.isArray(pkg.features) ? pkg.features : [],
        }));
        setPackages(processedPackages);
      } catch (err) {
        console.error("Failed to load packages:", err);
        setError("Could not load package information. Please try again later.");
        toast.error("Could not load package information.");
        setLoading(false); // Set loading false on error too
      }
      // Don't set loading false here yet, wait for package finding
    };
    loadPackages();
  }, []); // Run only once on mount

  // Find the selected package ID once packages are loaded and planName is available
  useEffect(() => {
    // Only proceed if packages are loaded
    if (packages.length === 0 && loading) return; // Still loading packages
    if (packages.length === 0 && !loading) return; // Packages failed to load
    
    if (planName) {
      const foundPackage = packages.find(
        pkg => pkg.name.toLowerCase() === planName.toLowerCase()
      );

      if (foundPackage) {
        setSelectedPackage(foundPackage);
        setError(null);
      } else {
        console.error(`Checkout Error: Plan named "${planName}" not found.`);
        setError(`The selected plan (${planName}) could not be found.`);
        toast.error(`Selected plan (${planName}) not found.`);
        setSelectedPackage(null);
      }
    } else {
        setError("No plan specified. Please select a plan.");
        setSelectedPackage(null);
    }
    setLoading(false); // Finished attempting to find package

  }, [packages, planName, loading]); // Depend on loading state too

  // Render loading state
  if (loading) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /> Loading checkout...</div>;
  }

  // Render error state
  if (error || !selectedPackage) { // Also treat missing selectedPackage as an error state
    return <div className="text-center py-10 text-red-600">Error: {error || "Could not load selected plan details."}</div>;
  }

  // ---- RENDER CHECKOUT WITH SUMMARY AND FORM ----
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* --- Order Summary Column --- */}
      <div className="space-y-6 lg:sticky lg:top-24">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{selectedPackage.name} Plan</h3>
                  <p className="text-sm text-muted-foreground">Monthly subscription</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    {/* Optional: Display original price if applicable */}
                    {selectedPackage.originalPrice && selectedPackage.originalPrice > selectedPackage.price && (
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        ${selectedPackage.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="font-semibold">${selectedPackage.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">/month</p>
                </div>
              </div>
              <hr />
              <h4 className="font-medium">Features Included:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {selectedPackage.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Due Today</span>
                <span>${selectedPackage.price.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Secure checkout info box */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Secure Checkout</p>
              <p className="text-sm text-blue-700">
                Your payment information is processed securely by Stripe. We don't store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Payment Form Column --- */}
      <div>
        <Card>
            <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Enter your card information below.</CardDescription>
            </CardHeader>
            <CardContent>
                <Elements stripe={stripePromise}>
                    <CheckoutForm packageId={selectedPackage.id} />
                </Elements>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <Suspense fallback={<div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /> Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
} 