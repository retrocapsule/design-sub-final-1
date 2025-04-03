'use client';

import { useState } from 'react';
import Link from 'next/link';
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

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsSubmitted(false); // Reset submission state on new attempt
    console.log('Requesting password reset for:', values.email);

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      // Log the raw response text FIRST
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Now try to parse as JSON
      const result = JSON.parse(responseText); 

      if (!response.ok) {
        // Use error message from API if available, otherwise generic
        throw new Error(result.error || 'Failed to send reset link');
      }

      toast.success('If an account exists for this email, a reset link has been sent.');
      setIsSubmitted(true); // Show confirmation message
      form.reset(); // Clear the form

    } catch (error) {
      console.error('Password reset request error:', error);
      // Check if error is an instance of Error to safely access message
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error(message); 
      setIsSubmitted(false); // Ensure submission message is hidden on error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Your Password?</CardTitle>
          <CardDescription>
            No problem! Enter your email below and we&apos;ll send you a link to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center space-y-4 p-6 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 font-medium">Reset link sent!</p>
              <p className="text-slate-600 text-sm">
Please check your email inbox (and spam folder) for instructions on how to reset your password.
              </p>
              <Button variant="outline" asChild>
                <Link href="/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                </Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/signin" className="text-primary hover:text-primary/90">
                     Remembered your password? Sign in
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 