'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Navigation } from '@/components/layout/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Loader2, CheckCircle2, ArrowRight, LockIcon, Info, Shield } from 'lucide-react';
import Link from 'next/link';

// Define Package type locally
interface Package {
  id: string;
  name: string;
  description?: string | null; // Make description optional
  price: number;
  originalPrice?: number | null; // Make originalPrice optional
  features: string[]; // Assuming features will be parsed into string[]
  isActive: boolean;
  stripePriceId?: string | null; // Make stripePriceId optional
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

function SubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Package | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [activeTab, setActiveTab] = useState('login');

  const planNameFromUrl = searchParams.get('plan');

  // Fetch packages on mount
  useEffect(() => {
    const loadPackages = async () => {
      setLoadingPackages(true);
      try {
        // Fetch from the API route
        const response = await fetch('/api/packages'); 
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const fetchedPackages: Package[] = await response.json();
         // Ensure features is always an array of strings
        const processedPackages = fetchedPackages.map(pkg => ({
          ...pkg,
          features: Array.isArray(pkg.features) ? pkg.features : [],
        }));
        setPackages(processedPackages);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
        toast.error("Could not load subscription plans.");
      } finally {
        setLoadingPackages(false);
      }
    };
    loadPackages();
  }, []);

  // Set selected plan based on URL or localStorage
  useEffect(() => {
    if (packages.length > 0) {
      let planToSelect: Package | null = null;
      const planName = planNameFromUrl || localStorage.getItem('selectedCheckoutPlan');

      if (planName) {
        planToSelect = packages.find(p => p.name.toLowerCase() === planName.toLowerCase()) || null;
        if (planToSelect) {
          setSelectedPlan(planToSelect);
          if (!planNameFromUrl) {
            router.replace(`/subscribe?plan=${planToSelect.name}`, { scroll: false });
          }
          localStorage.removeItem('selectedCheckoutPlan');
        }
      }
    }
  }, [packages, planNameFromUrl, router]);

  // Redirect authenticated users with a plan directly to checkout
  useEffect(() => {
    if (status === 'authenticated' && selectedPlan) {
      router.push(`/checkout?package=${selectedPlan.id}`);
    }
  }, [status, selectedPlan, router]);
  
  const handleSelectPlan = (pkg: Package) => {
    setSelectedPlan(pkg);
    localStorage.setItem('selectedCheckoutPlan', pkg.name);
    router.push(`/subscribe?plan=${pkg.name}`, { scroll: false });
  };

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
         redirect: false,
         callbackUrl: selectedPlan ? `/checkout?package=${selectedPlan.id}` : '/dashboard'
       });
       if (result?.error) {
         toast.error(result.error === 'CredentialsSignin' ? 'Invalid email or password.' : 'Sign in failed.');
       } else {
         toast.success('Signed in successfully');
         await update(); 
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
         setActiveTab('login');
         setAuthLoading(false);
         return;
      }
      const regRes = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: authForm.name, email: authForm.email, password: authForm.password }) });
      if (!regRes.ok) throw new Error((await regRes.json()).message || 'Signup failed');
      toast.success('Account created!');
      const signInRes = await signIn('credentials', { email: authForm.email, password: authForm.password, redirect: false, callbackUrl: selectedPlan ? `/checkout?package=${selectedPlan.id}` : '/dashboard' });
      if (signInRes?.error) {
         toast.error('Auto sign-in failed. Please sign in manually.');
         setActiveTab('login');
      } else {
         toast.success('Signed in successfully');
         await update();
      }
    } catch (error: any) { toast.error(error.message || 'Signup failed'); }
    finally { setAuthLoading(false); }
  };

  // --- Render Logic ---

  if (status === 'loading' || loadingPackages) {
    return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!selectedPlan) {
    return (
       <div className="container mx-auto px-4 py-12">
         <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {packages.map((pkg) => (
             <Card key={pkg.id} className="flex flex-col">
               <CardHeader>
                 <CardTitle>{pkg.name}</CardTitle>
                 <CardDescription>{pkg.description || ''}</CardDescription> {/* Added fallback */}
               </CardHeader>
               <CardContent className="flex-grow">
                 <p className="text-3xl font-bold mb-4">
                   ${pkg.price}
                   <span className="text-sm font-normal text-muted-foreground">/month</span>
                 </p>
                 <ul className="space-y-2 text-sm text-muted-foreground">
                   {pkg.features.map((feature, i) => (
                     <li key={i} className="flex items-center">
                       <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                       {feature}
                     </li>
                   ))}
                 </ul>
               </CardContent>
               <CardFooter>
                 <Button className="w-full" onClick={() => handleSelectPlan(pkg)}>
                   Select Plan
                 </Button>
               </CardFooter>
             </Card>
           ))}
         </div>
       </div>
    );
  }

  if (status !== 'authenticated' && selectedPlan) {
     return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Order Summary */}
          <div className="space-y-6 sticky top-24">
             <Card>
               <CardHeader>
                 <CardTitle>Order Summary</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <h3 className="font-medium">{selectedPlan.name} Plan</h3>
                     <p className="font-medium">${selectedPlan.price.toFixed(2)}/month</p>
                   </div>
                   <hr />
                   <h4 className="font-medium">Features:</h4>
                   <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                     {selectedPlan.features.map((feature, i) => <li key={i}>{feature}</li>)}
                   </ul>
                   <hr />
                   <div className="flex justify-between font-medium text-lg">
                      <span>Total Due Today</span>
                      <span>${selectedPlan.price.toFixed(2)}</span>
                   </div>
                 </div>
               </CardContent>
             </Card>
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
          </div>
        </div>
      </div>
     );
  }
  
  return null; 
}

export default function SubscribePage() {
  return (
    <>
      <Navigation /> 
      <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <SubscribeContent />
      </Suspense>
    </>
  );
} 