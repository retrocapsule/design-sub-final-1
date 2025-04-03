'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navigation } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, ArrowRight, Sparkles, Users, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';
import React from 'react';

const onboardingSteps = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Tell us about your business to help us deliver better designs',
    icon: Users,
  },
  {
    id: 'preferences',
    title: 'Set Your Preferences',
    description: 'Customize your design preferences and communication settings',
    icon: Target,
  },
  {
    id: 'first-request',
    title: 'Submit Your First Request',
    description: 'Get started by submitting your first design request',
    icon: Zap,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const handleNext = async () => {
    setLoading(true);
    try {
      // Save progress to the database
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: onboardingSteps[currentStep].id,
        }),
      });

      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete onboarding and redirect to dashboard
        await fetch('/api/onboarding/complete', {
          method: 'POST',
        });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress');
    } finally {
      setLoading(false);
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Welcome to DesignSub!</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Let's Get You Started</h1>
            <p className="text-xl text-muted-foreground">
              Complete these steps to begin your design journey
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {onboardingSteps.length}
              </span>
            </div>
            <Progress value={(currentStep + 1) / onboardingSteps.length * 100} />
          </div>

          {/* Current Step Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  {React.createElement(onboardingSteps[currentStep].icon, { 
                    className: "h-6 w-6 text-primary" 
                  })}
                </div>
                <div>
                  <CardTitle>{onboardingSteps[currentStep].title}</CardTitle>
                  <CardDescription>
                    {onboardingSteps[currentStep].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Step-specific content will be rendered here */}
              <div className="space-y-6">
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Your subscription is active</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Payment method is set up</span>
                    </div>
                  </div>
                )}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Profile information is complete</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Preferences are saved</span>
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>You're ready to submit requests</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>Design team is ready to help</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {currentStep === onboardingSteps.length - 1 ? 'Complete Setup' : 'Continue'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 