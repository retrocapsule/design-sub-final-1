'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/navigation'; // Corrected import path and named import
import Footer from '@/components/Footer'; // Adjust path if necessary
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';

// Placeholder for a relevant image
const PlaceholderImage = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
    <span className="text-gray-500">Relevant Image</span>
  </div>
);

export default function ClothingBrandsPage() {
  const router = useRouter();

  const navigateToPricing = () => {
    router.push('/pricing');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Elevate Your Clothing Brand with Standout Designs
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Get unlimited, high-quality designs for your fashion brand, from ad creatives to tech packs, delivered fast.
            </p>
            <Button size="lg" onClick={navigateToPricing}>
              View Pricing & Plans <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <PlaceholderImage className="w-full h-64 md:h-96" />
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">
            Stop Blending In, Start Setting Trends
          </h2>
          <p className="text-gray-600 mb-10 max-w-3xl mx-auto">
            Tired of inconsistent branding, slow design turnarounds, and creatives that don't convert? Your brand deserves design that captures attention and drives sales.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Card>
              <CardHeader><CardTitle className="text-lg">Inconsistent Visuals</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">Lookbooks, social media, and ads lack a cohesive aesthetic, weakening brand recognition.</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Slow Turnarounds</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">Waiting weeks for designs stalls your marketing campaigns and product launches.</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Ineffective Ad Creatives</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">Generic ads fail to stop the scroll and drive traffic to your online store.</p></CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <PlaceholderImage className="w-full h-64 md:h-80 order-last md:order-first" />
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Your On-Demand Design Partner for Fashion</h2>
            <p className="text-gray-600 mb-6">
              DesignSub delivers the stunning visuals your clothing brand needs. Get a dedicated design team for a flat monthly fee. We handle everything from concept to final graphic, ensuring your brand looks premium and stays consistent.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                <span>Receive unique, on-brand designs tailored to the fashion industry.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                <span>Launch campaigns faster with quick design iterations and deliveries.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                <span>Get high-converting ad creatives, social media assets, and e-commerce graphics.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works / Key Features Section */}
      <section className="py-16 px-4">
         <div className="container mx-auto text-center">
           <h2 className="text-3xl font-semibold mb-10 text-gray-800">Effortless Design for Your Brand</h2>
           <div className="grid md:grid-cols-3 gap-8">
             {/* Feature 1 */}
             <div className="text-center">
               <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">1</div>
               <h3 className="text-xl font-medium mb-2">Subscribe & Request</h3>
               <p className="text-gray-600">Choose a plan, submit unlimited design requests via our simple platform.</p>
             </div>
             {/* Feature 2 */}
             <div className="text-center">
               <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">2</div>
               <h3 className="text-xl font-medium mb-2">Fast Revisions</h3>
               <p className="text-gray-600">Get your designs back quickly (usually 24-48 hours). Request as many revisions as needed.</p>
             </div>
             {/* Feature 3 */}
             <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">3</div>
               <h3 className="text-xl font-medium mb-2">Approve & Scale</h3>
               <p className="text-gray-600">Approve your final designs and easily scale your output as your brand grows.</p>
             </div>
           </div>
         </div>
       </section>

      {/* Pricing Snippet Section */}
      <section className="bg-primary/5 py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">Simple, Predictable Pricing</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Focus on growing your clothing brand, not haggling over design fees. Choose a plan that fits your needs.
          </p>
          {/* Optional: Add simple plan highlights here if desired */}
          <Button size="lg" variant="default" onClick={navigateToPricing}>
            See Full Pricing Details <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">Pause or cancel your subscription anytime.</p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">Ready to Dress Your Brand for Success?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Stop settling for mediocre design. Partner with DesignSub and get the visuals your clothing brand needs to thrive.
          </p>
          <Button size="lg" onClick={navigateToPricing}>
            View Plans & Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
} 