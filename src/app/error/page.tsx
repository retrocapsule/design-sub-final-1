'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [callbackUrl, setCallbackUrl] = useState<string>('');

  useEffect(() => {
    // Get error message and callback URL from query parameters
    const errorParam = searchParams.get('error');
    const callbackParam = searchParams.get('callbackUrl');
    
    if (errorParam) {
      switch (errorParam) {
        case 'Configuration':
          setError('There is a problem with the server configuration.');
          break;
        case 'AccessDenied':
          setError('You do not have access to this resource.');
          break;
        case 'Verification':
          setError('The verification link was invalid or has expired.');
          break;
        default:
          setError('An unexpected error occurred during authentication.');
          break;
      }
    } else {
      setError('An unexpected error occurred.');
    }

    if (callbackParam) {
      setCallbackUrl(callbackParam);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription className="text-lg mt-2">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              Please try signing in again. If the problem persists, contact customer support.
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="w-1/2"
                onClick={() => router.back()}
              >
                Go Back
              </Button>
              
              <Link 
                href={callbackUrl ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/signin'} 
                className="w-1/2"
              >
                <Button className="w-full">
                  Try Again
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 