'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from "@/components/layout/navbar";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const [isCheckoutFlow, setIsCheckoutFlow] = useState(false);
  
  useEffect(() => {
    // Check if this signup is coming from a checkout flow
    const callbackUrl = searchParams.get('callbackUrl');
    if (callbackUrl && (callbackUrl.includes('/subscribe') || callbackUrl.includes('/checkout'))) {
      setIsCheckoutFlow(true);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              {isCheckoutFlow ? 'Create your account to continue' : 'Create your account'}
            </h1>
            <p className="mt-2 text-slate-600">
              {isCheckoutFlow 
                ? 'You need an account to complete your subscription'
                : 'Get started with your design subscription today'}
            </p>
            {isCheckoutFlow && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                Just one step away from completing your subscription! Create an account to continue.
              </div>
            )}
          </div>
          
          <SignUpForm />
          
        </div>
      </div>
    </div>
  );
} 