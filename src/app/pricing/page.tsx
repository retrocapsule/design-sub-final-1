'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/layout/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Sparkles, Info, Star, TrendingUp, Zap, Users, DollarSign, HelpCircle, RefreshCcw, Clock, XCircle, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Package {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  features: string[];  // Array of strings
  isActive: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      console.log('Fetching packages...');
      const response = await fetch('/api/packages');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Fetched packages:', data);
      if (data.error) {
        throw new Error(data.error);
      }
      setPackages(data.filter((pkg: Package) => pkg.isActive));
      console.log('Filtered active packages:', data.filter((pkg: Package) => pkg.isActive));
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFeatures = (pkg: Package): string[] => {
    return pkg.features;
  };

  // Helper function to determine if a package is the middle one (for styling)
  const isPopularPlan = (index: number, total: number): boolean => {
    return total > 1 && index === Math.floor(total / 2);
  };

  // Helper to calculate savings
  const calculateSavings = (originalPrice: number, price: number): string | null => {
    const savings = originalPrice - price;
    if (savings > 0) {
      // Could also calculate percentage: const percentage = Math.round((savings / originalPrice) * 100);
      return `$${savings}/mo`;
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Focus on Growth, Not Design Bottlenecks</h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8">
                Get unlimited premium designs delivered fast, all for a predictable flat monthly fee. Cancel anytime.
              </p>
            </div>
            
            {loading && (
              <div className="flex justify-center items-center h-64">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            )}

            {!loading && packages.length > 0 && (
              <div id="pricing-cards-section" className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {packages.map((pkg, index) => {
                  const savingsText = calculateSavings(pkg.originalPrice, pkg.price);
                  const popular = isPopularPlan(index, packages.length);
                  return (
                    <Card key={pkg.id} className={cn(
                      "flex flex-col", 
                      popular ? "border-primary border-2 shadow-lg relative" : "border"
                    )}>
                      {popular && (
                        <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">Most Popular</div>
                      )}
                      <CardHeader className="pt-6">
                        <CardTitle className="text-2xl font-semibold">{pkg.name}</CardTitle>
                        <CardDescription>Includes:</CardDescription> 
                        <div className="mt-4">
                          <div className="flex items-baseline">
                            <span className="text-4xl font-bold">${pkg.price}</span>
                            <span className="ml-1.5 text-slate-500 text-sm">/month</span>
                          </div>
                          {savingsText && (
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-slate-500 line-through">
                                ${pkg.originalPrice}
                              </span>
                              <span className="ml-2 text-sm text-green-600 font-medium">Save {savingsText}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <ul className="space-y-3">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="mt-6">
                        <Link 
                          href={`/checkout?plan=${pkg.name.toLowerCase()}`}
                          className="w-full"
                        >
                          <Button size="lg" className="w-full" variant={popular ? 'default' : 'outline'}>
                            {popular ? 'Choose Plan' : 'Get Started'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
            {!loading && packages.length === 0 && (
                <p className="text-center text-slate-600">Could not load pricing plans. Please try again later.</p>
            )}
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                 <h2 className="text-3xl font-bold mb-6">Never Wait on Designs Again</h2>
                 <ul className="space-y-4">
                    <li className="flex items-start">
                      <Zap className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0"/>
                      <div>
                        <h4 className="font-semibold">Lightning-Fast Delivery</h4>
                        <p className="text-slate-600 text-sm">Get your designs back in days, not weeks. Keep your projects moving forward.</p>
                      </div>
                    </li>
                     <li className="flex items-start">
                      <DollarSign className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0"/>
                      <div>
                        <h4 className="font-semibold">Predictable Flat Rate</h4>
                        <p className="text-slate-600 text-sm">One simple monthly fee for unlimited requests & revisions. No surprise costs.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <RefreshCcw className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0"/>
                      <div>
                        <h4 className="font-semibold">Truly Unlimited Revisions</h4>
                        <p className="text-slate-600 text-sm">We revise until you're 100% happy. Your satisfaction is guaranteed.</p>
                      </div>
                    </li>
                     <li className="flex items-start">
                      <XCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0"/>
                      <div>
                        <h4 className="font-semibold">Cancel Anytime</h4>
                        <p className="text-slate-600 text-sm">No long-term contracts. Pause or cancel your subscription easily.</p>
                      </div>
                    </li>
                 </ul>
              </div>
              <div className="bg-slate-100 p-8 rounded-lg border">
                <Star className="h-5 w-5 text-yellow-400 mb-4" />
                <blockquote className="text-slate-700 italic mb-4">
                  "Switching to this subscription was a game-changer. We get designs faster than ever, and knowing the exact cost each month helps massively with budgeting. Highly recommend!"
                </blockquote>
                <p className="font-semibold">Jane Doe</p>
                <p className="text-sm text-slate-500">Marketing Manager, ExampleCorp</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Still Have Questions?</h2>
            
            <div className="space-y-8">
               <div>
                <h3 className="text-xl font-semibold mb-2">How does "unlimited requests" work?</h3>
                <p className="text-slate-600">You can add as many design requests to your queue as you like. We'll work on them sequentially, based on your chosen plan's capacity (usually 1-2 active requests at a time). As soon as one is complete, we move to the next!</p>
              </div>
              <div><h3 className="text-xl font-semibold mb-2">What kind of designs can I request?</h3><p className="text-slate-600">Logos, websites, social media graphics, brochures, packaging, and more. If it's graphic design, it's likely included.</p></div>
              <div><h3 className="text-xl font-semibold mb-2">How long does it take?</h3><p className="text-slate-600">Most requests are delivered in a few business days (often 24-48 hours). Complex requests may take longer.</p></div>
              <div><h3 className="text-xl font-semibold mb-2">How many revisions can I request?</h3><p className="text-slate-600">Unlimited! We revise until you're 100% satisfied.</p></div>
              <div><h3 className="text-xl font-semibold mb-2">Can I cancel my subscription anytime?</h3><p className="text-slate-600">Yes, absolutely. You can manage your subscription easily from your dashboard. Cancel anytime, no questions asked.</p></div>
            </div>
          </div>
        </section>
      </main>
      
      <section className="py-16 px-4 md:px-6 bg-slate-900 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Streamline Your Design Workflow?</h2>
          <p className="text-xl opacity-90 mb-8">
            Stop waiting, start creating. Choose your plan and get started today.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => document.getElementById('pricing-cards-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Choose Your Plan
          </Button>
        </div>
      </section>
    </div>
  );
} 