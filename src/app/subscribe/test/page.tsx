'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface Package {
  id: string;
  name: string;
  price: number;
  features: string[];
  isActive: boolean;
}

export default function TestSubscriptionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPackages();
    } else if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/packages');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch packages');
      }
      const data = await response.json();
      setPackages(data);
      const activePackage = data.find((pkg: Package) => pkg.isActive);
      if (activePackage) {
        setSelectedPackage(activePackage);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    if (subscribing) return;
    setSubscribing(true);

    try {
      const response = await fetch('/api/subscribe/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to create test subscription');
      }

      toast.success('Test subscription created successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating test subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create test subscription');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (status === 'authenticated' && packages.length === 0) {
      return (
          <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-2xl font-semibold mb-4">Could not load packages</h1>
              <p className="text-muted-foreground mb-4">There was an issue loading the subscription packages. Please try again later.</p>
              <Button onClick={() => fetchPackages()} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Retry
              </Button>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Test Package</h1>
        <p className="text-muted-foreground">Select a package to start your test subscription</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`cursor-pointer transition-all ${
              selectedPackage?.id === pkg.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedPackage(pkg)}
          >
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>
                ${pkg.price}/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={selectedPackage?.id === pkg.id ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPackage(pkg);
                }}
              >
                {selectedPackage?.id === pkg.id ? 'Selected' : 'Select Package'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={handleSubscribe}
          disabled={!selectedPackage || subscribing || loading}
        >
          {subscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {subscribing ? 'Creating Subscription...' : 'Start Test Subscription'}
        </Button>
      </div>
    </div>
  );
} 