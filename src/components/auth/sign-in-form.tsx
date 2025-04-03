'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');
  const [isCheckoutFlow, setIsCheckoutFlow] = useState(false);

  useEffect(() => {
    // Get the callbackUrl from URL query parameters
    const callback = searchParams.get('callbackUrl');
    if (callback) {
      console.log('Found callback URL:', callback);
      setCallbackUrl(callback);
      
      // Check if this is a checkout flow
      if (callback.includes('/subscribe') || callback.includes('/checkout')) {
        setIsCheckoutFlow(true);
      }
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log('Attempting sign in with:', values.email);
    console.log('Will redirect to:', callbackUrl);

    try {
      // Use redirect: false to handle redirection manually
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      
      console.log('Sign in result:', result);

      if (result?.error) {
        toast.error('Invalid email or password');
        setIsLoading(false);
        return;
      }

      toast.success('Signed in successfully');
      
      // Manual redirect after successful authentication
      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 300);
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Something went wrong');
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isCheckoutFlow && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <p className="text-blue-700 text-sm">
              Sign in to continue with your subscription checkout.
            </p>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link href="/forgot-password" className="text-primary hover:text-primary/90">
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : isCheckoutFlow ? 'Sign in & Continue to Checkout' : 'Sign in'}
        </Button>
        
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link 
            href={`/signup${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="text-primary hover:text-primary/90 font-medium"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
} 