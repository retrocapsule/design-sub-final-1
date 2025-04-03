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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [autoSigningIn, setAutoSigningIn] = useState(false);

  useEffect(() => {
    // Get the callbackUrl from URL query parameters
    const callback = searchParams.get('callbackUrl');
    if (callback) {
      console.log('Found callback URL:', callback);
      setCallbackUrl(callback);
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log('Will redirect to:', callbackUrl);

    try {
      // Step 1: Create the account
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      toast.success('Account created successfully!');
      
      // Step 2: Automatically sign in and redirect
      setAutoSigningIn(true);
      
      // Small delay to ensure account is properly created
      setTimeout(async () => {
        try {
          const result = await signIn('credentials', {
            email: values.email,
            password: values.password,
            redirect: false,
          });
  
          if (result?.error) {
            toast.error('Could not sign in automatically. Please try signing in manually.');
            setIsLoading(false);
            setAutoSigningIn(false);
            return;
          }
  
          // Successful login, now redirect to the original checkout URL
          console.log('Successfully signed in, redirecting to:', callbackUrl);
          router.push(callbackUrl);
        } catch (error) {
          console.error('Auto sign-in error:', error);
          toast.error('Failed to sign in automatically. Please try signing in manually.');
          setIsLoading(false);
          setAutoSigningIn(false);
        }
      }, 800); // Slight delay before signing in
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
      setIsLoading(false);
    }
  }

  if (autoSigningIn) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-medium text-green-800 mb-2">Account Created Successfully!</h3>
          <p className="text-green-700 mb-4">
            Signing you in and redirecting to checkout...
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign up'}
        </Button>
        
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link 
            href={`/signin${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="text-primary hover:text-primary/90 font-medium"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
} 