'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Shield, CheckCircle2, ArrowRight, Info, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Package {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  features: any;  // JSON type from Prisma
  isActive: boolean;
}

export default function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Package | null>(null);
  const plan = searchParams.get('plan');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    zipCode: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Store the current URL to redirect back after sign in
      const currentUrl = window.location.href;
      router.push(`/signin?callbackUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.name) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || ''
      }));
    }
  }, [session]);

  useEffect(() => {
    if (plan) {
      fetchPackage();
    }
  }, [plan]);

  const fetchPackage = async () => {
    try {
      const response = await fetch('/api/packages');
      const data = await response.json();
      const foundPlan = data.find((pkg: Package) => pkg.name.toLowerCase() === plan?.toLowerCase());
      if (foundPlan) {
        setSelectedPlan(foundPlan);
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      toast.error('Failed to fetch package details');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Redirect to success page
      router.push('/onboarding');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to process payment');
      setLoading(false);
    }
  };

  const getFeatures = (pkg: Package): string[] => {
    try {
      return Array.isArray(pkg.features) ? pkg.features : [];
    } catch (error) {
      console.error('Error getting features:', error);
      return [];
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>No Plan Selected</CardTitle>
              <CardDescription>
                Please select a plan from the pricing page to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push('/pricing')}
              >
                View Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{selectedPlan?.name} Plan</h3>
                        <p className="text-sm text-muted-foreground">Monthly subscription</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-sm text-muted-foreground line-through mr-2">
                            ${selectedPlan?.originalPrice}
                          </span>
                          <span className="font-medium">${selectedPlan?.price}</span>
                        </div>
                        <p className="text-sm text-green-600">50% OFF</p>
                        <p className="text-sm text-muted-foreground">/month</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total</span>
                        <div className="text-right">
                          <div className="flex items-center justify-end">
                            <span className="text-sm text-muted-foreground line-through mr-2">
                              ${selectedPlan?.originalPrice}
                            </span>
                            <span className="font-medium">${selectedPlan?.price}</span>
                          </div>
                          <p className="text-sm text-green-600">50% OFF</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedPlan && getFeatures(selectedPlan).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Secure Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Complete your subscription with secure payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Cardholder Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          name="cvc"
                          value={formData.cvc}
                          onChange={handleInputChange}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="12345"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Subscribe Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Secure payment powered by Stripe</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 