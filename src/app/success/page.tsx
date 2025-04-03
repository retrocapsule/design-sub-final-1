'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Navigation from '@/components/Navigation'; // Assuming you have a Navigation component
import { toast } from 'sonner';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('Missing session ID. Cannot verify payment.');
      toast.error('Missing session ID.');
      // Optionally redirect to pricing or home after a delay
      // setTimeout(() => router.push('/pricing'), 5000);
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify session.');
        }

        if (data.verified && data.status === 'complete') {
          setStatus('success');
          toast.success('Payment successful! Redirecting...');
          // Redirect to onboarding after a short delay
          setTimeout(() => {
            router.push('/onboarding');
          }, 2000); // 2-second delay
        } else if (data.status === 'open') {
            setStatus('error');
            setErrorMessage('Payment session is still processing. Please wait a moment and refresh, or contact support if the issue persists.');
            toast.warning('Payment processing. Please wait.');
        } else {
           setStatus('error');
           setErrorMessage(data.error || 'Payment verification failed. Please contact support.');
           toast.error(data.error || 'Payment verification failed.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        const message = error instanceof Error ? error.message : 'An unexpected error occurred during verification.';
        setErrorMessage(message);
        toast.error(message);
      }
    };

    verifySession();
  }, [sessionId, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {status === 'loading' && 'Verifying Payment...'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'error' && 'Payment Verification Failed'}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Please wait while we confirm your payment.'}
              {status === 'success' && 'Your subscription is active. Redirecting you shortly...'}
              {status === 'error' && 'There was an issue verifying your payment.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {status === 'error' && (
              <div className="text-center">
                 <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                 <p className="text-sm text-red-700">{errorMessage}</p>
                 {/* Optional: Add button to retry or go to support/pricing */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  // Wrap content in Suspense because useSearchParams() needs it
  return (
    <Suspense fallback={
       <div className="flex flex-col min-h-screen">
         {/* You might want a simpler Navigation or none here */}
         {/* <Navigation /> */}
         <div className="flex-1 flex items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin" />
         </div>
       </div>
    }>
       <SuccessContent />
    </Suspense>
  );
}