'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/navigation'; // Corrected import path and named import
import Footer from '@/components/Footer'; // Adjust path if necessary
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Music, ArrowRight } from 'lucide-react'; // Added Music icon

// Placeholder for a relevant image
const PlaceholderImage = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
    <span className="text-gray-500">Relevant Music Image</span>
  </div>
);

export default function MusicArtistsPage() {
  const router = useRouter();

  const navigateToPricing = () => {
    router.push('/pricing');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-16 md:py-24 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Amplify Your Sound with Striking Visuals
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Get unlimited graphic design for your music career – album art, merch, social content, and more. Stand out and connect with fans.
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
            Stop Sounding Great But Looking Generic
          </h2>
          <p className="text-gray-600 mb-10 max-w-3xl mx-auto">
            Is your visual identity holding back your music? Weak artwork, inconsistent branding, and slow design processes can hurt your reach and fan connection.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Card>
              <CardHeader><CardTitle className="text-lg">Uninspired Album Art</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">Cover art doesn't capture the essence of your music or grab attention on streaming platforms.</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Inconsistent Artist Brand</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">Your visuals across platforms lack cohesion, confusing fans and weakening your image.</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Missed Promo Opportunities</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">Slow design holds up single releases, tour announcements, and merch drops.</p></CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-purple-50 py-16 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <PlaceholderImage className="w-full h-64 md:h-80 order-last md:order-first" />
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Your Dedicated Design Crew for Music</h2>
            <p className="text-gray-600 mb-6">
              DesignSub provides the stunning visuals your music deserves. Get a reliable design partner who understands artist branding. We craft everything from iconic covers to engaging social posts, helping you build a stronger connection with your audience.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                <span>Get unique artwork and branding that reflects your musical style.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                <span>Receive designs quickly for timely releases and promotion schedules.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                <span>Boost fan engagement with eye-catching social media graphics and merch designs.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works / Key Features Section - Same structure, potentially adjust emphasis */}
       <section className="py-16 px-4">
         <div className="container mx-auto text-center">
           <h2 className="text-3xl font-semibold mb-10 text-gray-800">Focus on Music, We'll Handle the Visuals</h2>
           {/* Using the same 3-step process description */}
           <div className="grid md:grid-cols-3 gap-8">
             <div className="text-center">
               <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">1</div>
               <h3 className="text-xl font-medium mb-2">Subscribe & Request</h3>
               <p className="text-gray-600">Pick your plan, tell us what you need – album art, social kit, merch, etc.</p>
             </div>
             <div className="text-center">
               <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">2</div>
               <h3 className="text-xl font-medium mb-2">Review & Refine</h3>
               <p className="text-gray-600">Get initial concepts fast. Unlimited revisions until it perfectly matches your vision.</p>
             </div>
             <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">3</div>
               <h3 className="text-xl font-medium mb-2">Download & Promote</h3>
               <p className="text-gray-600">Approve your final designs, ready for streaming platforms, printers, and social media.</p>
             </div>
           </div>
         </div>
       </section>

      {/* Pricing Snippet Section */}
      <section className="bg-primary/5 py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">Affordable Design for Artists</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Invest in your visual brand without breaking the bank. Flat-rate design subscription built for musicians.
          </p>
          <Button size="lg" variant="default" onClick={navigateToPricing}>
            See Full Pricing Details <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">Perfect for solo artists, bands, producers, and labels.</p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">Ready to Look as Good as You Sound?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Give your music the visual identity it deserves. Let's create something amazing together.
          </p>
          <Button size="lg" onClick={navigateToPricing}>
            View Plans & Get Started <Music className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
} 