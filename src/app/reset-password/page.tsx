'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

// Schema for password validation
const formSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Error applies to the confirm password field
});

// Inner component to handle Suspense and searchParams
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
      // Optional: redirect after a delay
      // setTimeout(() => router.push('/signin'), 5000);
    }
  }, [token, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }
    setIsLoading(true);
    setError(null); // Clear previous errors
    console.log('Attempting password reset with token:', token);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: values.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      toast.success('Password reset successfully!');
      setIsSuccess(true);
      form.reset();
      // Optional: redirect after a delay
      // setTimeout(() => router.push('/signin'), 3000);

    } catch (error) {
      console.error('Password reset error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setError(message); // Show specific error
      toast.error(message); 
    } finally {
      setIsLoading(false);
    }
  }

  if (error && !isSuccess) {
    return (
      <div className="text-center space-y-4 p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700 font-medium">Error</p>
        <p className="text-slate-600 text-sm">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/forgot-password">
            Request New Link
          </Link>
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 p-6 bg-green-50 rounded-lg border border-green-200">
        <p className="text-green-700 font-medium">Password Reset Successful!</p>
        <p className="text-slate-600 text-sm">
You can now sign in with your new password.
        </p>
        <Button variant="default" asChild>
          <Link href="/signin">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading || !token}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </Form>
  );
}

// Main page component using Suspense
export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
Enter and confirm your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Wrap the form in Suspense to wait for searchParams */}
          <Suspense fallback={<div>Loading...</div>}>
             <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
} 