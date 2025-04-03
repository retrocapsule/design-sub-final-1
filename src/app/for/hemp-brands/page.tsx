'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/navigation'; // Corrected import path and named import
import Footer from '@/components/Footer'; // Adjust path if necessary
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react'; // Added ShieldCheck icon

// Placeholder for a relevant image
const PlaceholderImage = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
    <span className="text-gray-500">Relevant Cannabis/THC Image</span>
  </div>
);

export default function CannabisBrandsPage() {
  const router = useRouter();

  const navigateToPricing = () => {
    router.push('/pricing');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-16 md:py-24 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Build Trust & Elevate Your Cannabis Brand
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Professional, compliant design for THC and cannabis businesses. From packaging to websites, get visuals that inspire confidence and drive growth.
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
            Stop Looking Unproven, Start Leading the Market
          </h2>
          <p className="text-gray-600 mb-10 max-w-3xl mx-auto">
            In the competitive cannabis space, generic design and unclear messaging can kill credibility. Are compliance worries and amateur visuals holding your brand back?
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Card>
              <CardHeader><CardTitle className="text-lg">Compliance Concerns</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">Packaging and marketing materials risk non-compliance due to complex regulations.</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Lack of Trust</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">Poor design makes potential customers question product quality and legitimacy.</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Difficult Information</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">Complex product benefits and usage instructions are hard to communicate clearly.</p></CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-green-50 py-16 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <PlaceholderImage className="w-full h-64 md:h-80 order-last md:order-first" />
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Designs That Build Confidence & Compliance</h2>
            <p className="text-gray-600 mb-6">
              DesignSub provides expert design for the THC and cannabis industry. We create packaging that meets regulations, websites that build trust, and marketing materials that educate consumers clearly, helping your brand stand out for the right reasons.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                <span>Get compliant packaging and label designs that look professional.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                <span>Build consumer trust with clear, credible website and marketing visuals.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                <span>Communicate complex information effectively through infographics and guides.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works / Key Features Section - Same structure */}
       <section className="py-16 px-4">
         <div className="container mx-auto text-center">
           <h2 className="text-3xl font-semibold mb-10 text-gray-800">Streamlined Design for Your Cannabis Business</h2>
            {/* Using the same 3-step process description */}
           <div className="grid md:grid-cols-3 gap-8">
             <div className="text-center">
               <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">1</div>
               <h3 className="text-xl font-medium mb-2">Subscribe & Request</h3>
               <p className="text-gray-600">Choose your plan, request designs for packaging, websites, ads, etc.</p>
             </div>
             <div className="text-center">
               <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">2</div>
               <h3 className="text-xl font-medium mb-2">Collaborate & Revise</h3>
               <p className="text-gray-600">Work with your designer, provide feedback, and get revisions fast.</p>
             </div>
             <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary font-bold text-xl">3</div>
               <h3 className="text-xl font-medium mb-2">Approve & Launch</h3>
               <p className="text-gray-600">Get final, compliant design files ready for production and marketing.</p>
             </div>
           </div>
         </div>
       </section>

      {/* Pricing Snippet Section */}
      <section className="bg-primary/5 py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">Transparent Pricing for Cannabis Brands</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get premium design without the premium price tag. Flat-rate monthly subscription designed for the needs of the cannabis industry.
          </p>
          <Button size="lg" variant="default" onClick={navigateToPricing}>
            See Full Pricing Details <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">Designs that meet industry standards.</p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">Ready to Grow Your Cannabis Brand with Confidence?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Elevate your brand image, build trust, and navigate compliance with professional design.
          </p>
          <Button size="lg" onClick={navigateToPricing}>
            View Plans & Get Started <ShieldCheck className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
} 