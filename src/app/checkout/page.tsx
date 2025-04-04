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
import { loadStripe, StripeError, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/checkout/checkout-form';

// --->>> ADDING LOG HERE <<<---
console.log("[Checkout Page Top Level] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

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

// REMOVE top-level stripePromise initialization
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Wrapper component to handle search params and fetch package ID
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planName = searchParams.get('plan'); // Get plan NAME from URL
  const { data: session, status, update } = useSession();

  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for Auth Form (only used if unauthenticated)
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [activeTab, setActiveTab] = useState('login');

  // State for Stripe Promise
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  // Effect to initialize Stripe Promise on mount
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key) {
      console.log("[CheckoutContent Effect] Initializing Stripe with key:", key);
      setStripePromise(loadStripe(key));
    } else {
      console.error("[CheckoutContent Effect] Stripe Publishable Key is missing!");
      setError("Payment gateway configuration error. Cannot initialize checkout.");
      toast.error("Checkout configuration error.");
    }
  }, []); // Run only once on mount

  // Fetch all packages on mount
  useEffect(() => {
    const loadPackages = async () => {
      setLoadingPackages(true);
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
      } finally {
        setLoadingPackages(false); // Packages loaded (or failed)
      }
    };
    loadPackages();
  }, []); // Run only once on mount

  // Find the selected package ID once packages are loaded and planName is available
  useEffect(() => {
    // Only proceed if packages are loaded
    if (packages.length === 0 && loadingPackages) return; // Still loading packages
    if (packages.length === 0 && !loadingPackages) return; // Packages failed to load
    
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
  }, [packages, planName, loadingPackages]); // Depend on loading state too

  // --- Authentication Handlers --- 
  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setAuthLoading(true);
     try {
       const result = await signIn('credentials', {
         email: authForm.email,
         password: authForm.password,
         redirect: false, // We want to stay on this page, session update will re-render
         // callbackUrl is not needed when redirect: false and we manually update
       });
       if (result?.error) {
         toast.error(result.error === 'CredentialsSignin' ? 'Invalid email or password.' : 'Sign in failed.');
       } else {
         toast.success('Signed in successfully');
         await update(); // Trigger session update to re-render as authenticated
       }
     } catch (error) { toast.error('Sign in failed.'); }
     finally { setAuthLoading(false); }
   };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.password !== authForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setAuthLoading(true);
    try {
      const checkRes = await fetch(`/api/auth/check-email?email=${encodeURIComponent(authForm.email)}`);
      const checkData = await checkRes.json();
      if (checkData.exists) {
         toast.error('Email already exists. Please sign in.');
         setActiveTab('login'); // Switch to login tab
         setAuthLoading(false);
         return;
      }
      const regRes = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: authForm.name, email: authForm.email, password: authForm.password }) });
      if (!regRes.ok) throw new Error((await regRes.json()).message || 'Signup failed');
      toast.success('Account created! Signing in...');
      // Attempt sign in after registration
      const signInRes = await signIn('credentials', { email: authForm.email, password: authForm.password, redirect: false });
      if (signInRes?.error) {
         toast.error('Auto sign-in failed. Please sign in manually.');
         setActiveTab('login'); // Switch to login tab after failed auto-signin
      } else {
         toast.success('Signed in successfully');
         await update(); // Trigger session update
      }
    } catch (error: any) { toast.error(error.message || 'Signup failed'); }
    finally { setAuthLoading(false); }
  };

  // Combined loading state for session and packages
  if (status === 'loading' || loadingPackages || !stripePromise) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /> Loading checkout...</div>;
  }

  // Render error state
  if (error || !selectedPackage) { // Also treat missing selectedPackage as an error state
    return <div className="text-center py-10 text-red-600">Error: {error || "Could not load selected plan details."}</div>;
  }

  // --->>> ADDING LOG HERE <<<---
  console.log("[CheckoutContent Render] Status:", status, "Selected Pkg:", !!selectedPackage);

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

      {/* --- Column 2: Auth Form OR Payment Form --- */}
      <div>
        {status === 'authenticated' ? (
          // --- Authenticated: Show Payment Form --- 
          <Card>
              <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                      You are signed in as {session?.user?.email}. Enter your card information below.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  {stripePromise && (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm packageId={selectedPackage.id} />
                    </Elements>
                  )}
              </CardContent>
          </Card>
        ) : (
          // --- Unauthenticated: Show Auth Form --- 
          <Card>
             <CardHeader>
                 <CardTitle>{activeTab === 'login' ? 'Sign In to Continue' : 'Create Account to Continue'}</CardTitle>
                 <CardDescription>
Please sign in or create an account to complete your subscription.
                 </CardDescription>
             </CardHeader>
             <CardContent>
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                   <TabsList className="grid w-full grid-cols-2">
                     <TabsTrigger value="login">Sign In</TabsTrigger>
                     <TabsTrigger value="signup">Create Account</TabsTrigger>
                   </TabsList>
                   <TabsContent value="login">
                     <form onSubmit={handleLogin} className="space-y-4 pt-4">
                       <div className="space-y-1">
                         <Label htmlFor="login-email">Email</Label>
                         <Input id="login-email" name="email" type="email" required value={authForm.email} onChange={handleAuthInputChange} />
                       </div>
                       <div className="space-y-1">
                         <Label htmlFor="login-password">Password</Label>
                         <Input id="login-password" name="password" type="password" required value={authForm.password} onChange={handleAuthInputChange} />
                         {/* Optional: Add Forgot Password Link */}
                          <div className="text-right text-sm">
                              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                                Forgot password?
                              </Link>
                          </div>
                       </div>
                       <Button type="submit" className="w-full" disabled={authLoading}>
                         {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                         Sign In & Continue
                       </Button>
                     </form>
                   </TabsContent>
                   <TabsContent value="signup">
                     <form onSubmit={handleSignup} className="space-y-4 pt-4">
                        <div className="space-y-1">
                         <Label htmlFor="signup-name">Name</Label>
                         <Input id="signup-name" name="name" required value={authForm.name} onChange={handleAuthInputChange} />
                       </div>
                       <div className="space-y-1">
                         <Label htmlFor="signup-email">Email</Label>
                         <Input id="signup-email" name="email" type="email" required value={authForm.email} onChange={handleAuthInputChange} />
                       </div>
                       <div className="space-y-1">
                         <Label htmlFor="signup-password">Password</Label>
                         <Input id="signup-password" name="password" type="password" required minLength={8} value={authForm.password} onChange={handleAuthInputChange} />
                       </div>
                       <div className="space-y-1">
                         <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                         <Input id="signup-confirmPassword" name="confirmPassword" type="password" required value={authForm.confirmPassword} onChange={handleAuthInputChange} />
                       </div>
                        <p className="text-xs text-muted-foreground">
                           By creating an account, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
                         </p>
                       <Button type="submit" className="w-full" disabled={authLoading}>
                         {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                         Create Account & Continue
                       </Button>
                     </form>
                   </TabsContent>
                 </Tabs>
              </CardContent>
          </Card>
        )}
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