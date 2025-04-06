'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function SignOutPage() {
  useEffect(() => {
    // Sign out the user when the component mounts
    signOut({ callbackUrl: '/' });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-semibold">Signing out...</h1>
        <p className="text-gray-500">You will be redirected to the home page.</p>
      </div>
    </div>
  );
} 