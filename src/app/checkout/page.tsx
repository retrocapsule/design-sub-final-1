'use client';

import { useEffect, useState } from 'react';
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

// ** NEW CHECKOUT FORM COMPONENT **
const CheckoutForm = ({ selectedPlan }: { selectedPlan: Package }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
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
        body: JSON.stringify({ planId: selectedPlan.id }), // Send plan ID or name
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
          // Optionally add billing details here if needed
          // billing_details: {
          //   name: session?.user?.name,
          //   email: session?.user?.email,
          // },
        },
        // If you are using setup_future_usage, set it here
        // setup_future_usage: 'off_session', // Example if needed for future charges
      });

      if (paymentResult.error) {
        // Show error to your customer (e.g., insufficient funds, card declined)
        setError(paymentResult.error.message || 'An unexpected payment error occurred.');
        toast.error(paymentResult.error.message || 'Payment failed.');
        setProcessing(false);
      } else {
        // Payment succeeded!
        // The payment intent status is now 'succeeded'.
        // The webhook (invoice.payment_succeeded) should handle database updates.
        console.log('Payment succeeded:', paymentResult.paymentIntent);
        toast.success('Payment successful! Your subscription is being activated.');
        
        // Redirect to onboarding or success page
        router.push('/onboarding');
        // No need to set processing false here as we are navigating away
      }
    } catch (err: any) {
      console.error('Subscription/Payment error:', err);
      const message = err.message || 'An unexpected error occurred.';
      setError(message);
      toast.error(message);
      setProcessing(false);
    }
  };
  
  // Styling for CardElement
  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d', // Customize as needed
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
    hidePostalCode: true // Optionally hide postal code
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-1">
          Credit or debit card
        </Label>
        <div className="px-3 py-3.5 border border-gray-300 rounded-md bg-white">
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
        size="lg"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Pay ${selectedPlan.price} and Subscribe
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
       <div className="flex items-center justify-center text-xs text-muted-foreground mt-2">
         <LockIcon className="h-3 w-3 mr-1" /> Secure payment powered by Stripe
       </div>
    </form>
  );
};


export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false); // General loading for login/signup
  const [selectedPlan, setSelectedPlan] = useState<Package | null>(null);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeTab, setActiveTab] = useState<string>('login');
  const plan = searchParams.get('plan');

  // Fetch packages on mount
  useEffect(() => {
    fetchAllPackages();
  }, []);

  useEffect(() => {
    // If user is authenticated, skip the auth section
    if (status === 'authenticated') {
      console.log('User already authenticated:', session?.user);
    }

    // Find the selected plan once packages are loaded
    if (plan && packages.length > 0) {
      findMatchingPlan(plan);
    }
  }, [status, session, plan, packages]);

  // Add a useEffect to handle restoring selected plan from localStorage
  useEffect(() => {
    // When we're authenticated but don't have a selected plan, try to get it from localStorage
    if (status === 'authenticated' && !selectedPlan && packages.length > 0) {
      const storedPlan = localStorage.getItem('selectedCheckoutPlan');
      if (storedPlan) {
        // Find the plan by name
        const foundPlan = packages.find(pkg => pkg.name === storedPlan);
        if (foundPlan) {
          setSelectedPlan(foundPlan);
          // Update the URL to include the plan parameter
          router.replace(`/checkout?plan=${storedPlan}`);

          // Clear localStorage
          localStorage.removeItem('selectedCheckoutPlan');
        }
      }
    }
  }, [status, selectedPlan, packages, router]);

  const fetchAllPackages = async () => {
    try {
      console.log('Fetching all packages...');
      const response = await fetch('/api/packages');
      const data = await response.json();
      console.log('Fetched packages:', data);
      setPackages(data);

      if (plan && data.length > 0) {
        findMatchingPlan(plan);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load subscription plans');
    }
  };

  const findMatchingPlan = (planName: string) => {
    if (!planName || packages.length === 0) return;

    // Try exact match first
    let foundPlan = packages.find(pkg => pkg.name === planName);

    // If not found, try case-insensitive match
    if (!foundPlan) {
      foundPlan = packages.find(pkg =>
        pkg.name.toLowerCase() === planName.toLowerCase()
      );
    }

    if (foundPlan) {
      setSelectedPlan(foundPlan);
    } else {
      console.error('Plan not found:', planName);
    }
  };

  // Handle form input changes
  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: authForm.email,
        password: authForm.password,
        redirect: false, // Prevent NextAuth from automatically redirecting
        callbackUrl: window.location.href // Specify where to return after auth
      });

      if (result?.error) {
        console.error('NextAuth SignIn Error:', result.error);
        // Map common errors to user-friendly messages
        if (result.error === 'CredentialsSignin') {
          toast.error('Invalid email or password.');
        } else {
          toast.error('Sign in failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      // If signIn was successful (no error), NextAuth handles the session.
      // We manually trigger a session update to fetch the latest data.
      await update();

      toast.success('Signed in successfully');
      setLoading(false); // Stop loading after successful sign in
      // Let the component re-render now that status is 'authenticated'

    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred during sign in.');
      setLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authForm.password !== authForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // 1. Check if email exists
      const checkResponse = await fetch(`/api/auth/check-email?email=${encodeURIComponent(authForm.email)}`);
      const checkData = await checkResponse.json();
      if (checkData.exists) {
        toast.error('An account with this email already exists. Please sign in.');
        setActiveTab('login');
        setLoading(false);
        return;
      }

      // 2. Register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        }),
      });
      const registerData = await registerResponse.json();
      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Failed to create account');
      }

      toast.success('Account created successfully');

      // 3. Sign in the new user
      const result = await signIn('credentials', {
        email: authForm.email,
        password: authForm.password,
        redirect: false,
        callbackUrl: window.location.href
      });

      if (result?.error) {
        console.error('Post-signup SignIn Error:', result.error);
        toast.error('Account created, but auto sign-in failed. Please sign in manually.');
        setActiveTab('login'); // Switch to login tab for manual sign-in
        setLoading(false);
        return;
      }

      // Manually update session
      await update();

      toast.success('Signed in successfully');
      setLoading(false); // Stop loading after successful signup and signin
      // Let the component re-render now that status is 'authenticated'

    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account or sign in.');
      setLoading(false);
    }
  };

  // Get features array from package
  const getFeatures = (pkg: Package): string[] => {
    if (Array.isArray(pkg.features)) {
      return pkg.features;
    }

    // Try to parse if it's a string
    if (typeof pkg.features === 'string') {
      try {
        const parsed = JSON.parse(pkg.features);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // If parsing fails, try splitting by comma (fallback)
        return pkg.features.split(',').map(f => f.trim());
      }
    }

    return [];
  };

  // --- Render Logic ---

  // Loading state for session
  if (status === 'loading' && !packages.length) {
     return (
       <div className="flex flex-col min-h-screen">
         <Navigation />
         <div className="flex-1 flex items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin" />
         </div>
       </div>
     );
   }


  // If no plan is selected, show plan selection
  if (!selectedPlan) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Select a Plan</CardTitle>
              <CardDescription>
                Please select a subscription plan to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <Button
                    key={pkg.id}
                    className="w-full justify-between"
                    variant={pkg.name === plan ? "default" : "outline"}
                    onClick={() => {
                      setSelectedPlan(pkg);
                      router.push(`/checkout?plan=${pkg.name}`);
                      // Store plan in localStorage in case user needs to login/signup
                      if (status !== 'authenticated') {
                         localStorage.setItem('selectedCheckoutPlan', pkg.name);
                      }
                    }}
                  >
                    <span>{pkg.name} - ${pkg.price}/month</span>
                    {pkg.name === plan && <CheckCircle2 className="h-4 w-4 ml-2" />}
                  </Button>
                ))
              ) : (
                 packages.length === 0 && status !== 'loading' ? (
                     <p className="text-center text-sm text-muted-foreground">No plans available.</p>
                 ) : (
                     <div className="flex items-center justify-center py-4">
                       <Loader2 className="h-6 w-6 animate-spin" />
                     </div>
                 )
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/pricing')}
              >
                Back to Pricing Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // If authenticated, show checkout with Elements form
  if (status === 'authenticated') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Order Summary */}
              <div className="space-y-6 lg:sticky lg:top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{selectedPlan.name} Plan</h3>
                          <p className="text-sm text-muted-foreground">Monthly subscription</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end">
                            {selectedPlan.originalPrice && selectedPlan.originalPrice > selectedPlan.price && (
                              <span className="text-sm text-muted-foreground line-through mr-2">
                                ${selectedPlan.originalPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="font-medium">${selectedPlan.price.toFixed(2)}</span>
                          </div>
                           {selectedPlan.originalPrice && selectedPlan.originalPrice > selectedPlan.price && (
                             <p className="text-sm text-green-600">Discount Applied</p>
                           )}
                          <p className="text-sm text-muted-foreground">/month</p>
                        </div>
                      </div>
                      <hr />
                       <h4 className="font-medium">Features Included:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {getFeatures(selectedPlan).map((feature, index) => (
                             <li key={index}>{feature}</li>
                           ))}
                         </ul>
                      <hr />
                      <div className="flex justify-between font-medium">
                        <span>Total Due Today</span>
                        <span>${selectedPlan.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                 {/* Secure checkout info box */}
                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                   <div className="flex items-start">
                     <Shield className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                     <div>
                       <p className="text-sm font-medium text-blue-800">Secure Checkout</p>
                       <p className="text-sm text-blue-700">
                         Your payment information is processed securely by Stripe. We don't store your card details.
                       </p>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Payment Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Complete your order</CardTitle>
                    <CardDescription>
                      You&apos;re signed in as {session.user.email}. Enter your payment details below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* ** WRAP CHECKOUT FORM WITH ELEMENTS PROVIDER ** */}
                    <Elements stripe={stripePromise}>
                      <CheckoutForm selectedPlan={selectedPlan} />
                    </Elements>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show login/signup form
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Order Summary */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPlan && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <div>
                           <h3 className="font-medium">{selectedPlan.name} Plan</h3>
                           <p className="text-sm text-muted-foreground">Monthly subscription</p>
                         </div>
                         <div className="text-right">
                           <div className="flex items-center justify-end">
                             {selectedPlan.originalPrice && selectedPlan.originalPrice > selectedPlan.price && (
                               <span className="text-sm text-muted-foreground line-through mr-2">
                                 ${selectedPlan.originalPrice.toFixed(2)}
                               </span>
                             )}
                             <span className="font-medium">${selectedPlan.price.toFixed(2)}</span>
                           </div>
                            {selectedPlan.originalPrice && selectedPlan.originalPrice > selectedPlan.price && (
                              <p className="text-sm text-green-600">Discount Applied</p>
                            )}
                           <p className="text-sm text-muted-foreground">/month</p>
                         </div>
                       </div>
                       <hr />
                       <h4 className="font-medium">Features Included:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {getFeatures(selectedPlan).map((feature, index) => (
                             <li key={index}>{feature}</li>
                           ))}
                         </ul>
                       <hr />
                      <div className="flex justify-between font-medium">
                        <span>Total Due Today</span>
                        <span>${selectedPlan.price.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Sign in prompt */}
               <Card className="bg-yellow-50 border-yellow-200">
                 <CardHeader className="flex flex-row items-center space-x-3">
                   <Info className="h-5 w-5 text-yellow-700" />
                   <div>
                     <CardTitle className="text-base text-yellow-800">Action Required</CardTitle>
                     <CardDescription className="text-yellow-700">
                       Please sign in or create an account to complete your subscription.
                     </CardDescription>
                   </div>
                 </CardHeader>
               </Card>
            </div>

            {/* Auth Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</CardTitle>
                  <CardDescription>
                    {activeTab === 'login'
                      ? 'Welcome back! Sign in to complete your purchase.'
                      : 'Create an account to subscribe and manage your service.'}
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
                          <Input
                            id="login-email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={authForm.email}
                            onChange={handleAuthInputChange}
                          />
                        </div>
                        <div className="space-y-1">
                           <div className="flex justify-between items-center">
                             <Label htmlFor="login-password">Password</Label>
                             <Link href="/forgot-password" // Add a link to password reset if you have one
                               className="text-sm font-medium text-primary hover:underline"
                               tabIndex={-1}
                             >
                               Forgot?
                             </Link>
                           </div>
                          <Input
                            id="login-password"
                            name="password"
                            type="password"
                            required
                            value={authForm.password}
                            onChange={handleAuthInputChange}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In & Continue'}
                        </Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="signup">
                      <form onSubmit={handleSignup} className="space-y-4 pt-4">
                        <div className="space-y-1">
                          <Label htmlFor="signup-name">Name</Label>
                          <Input
                            id="signup-name"
                            name="name"
                            required
                            value={authForm.name}
                            onChange={handleAuthInputChange}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={authForm.email}
                            onChange={handleAuthInputChange}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            name="password"
                            type="password"
                            required
                            minLength={8} // Add minLength for security
                            value={authForm.password}
                            onChange={handleAuthInputChange}
                          />
                          {/* Optionally add password strength indicator */}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                          <Input
                            id="signup-confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={authForm.confirmPassword}
                            onChange={handleAuthInputChange}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                           By creating an account, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
                         </p>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account & Continue'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 