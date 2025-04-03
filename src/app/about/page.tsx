'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Building, Users, Cpu, Target, ArrowRight } from 'lucide-react';

// Placeholder for a team/office image
const PlaceholderImage = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
    <span className="text-gray-500">Team/Office Image</span>
  </div>
);

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            About DesignSub
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Your dedicated creative partner, blending years of industry expertise with cutting-edge technology to elevate your brand.
          </p>
        </div>
      </section>

      {/* Our Story / Team Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-semibold mb-2 block">Who We Are</span>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Experienced Professionals Based in Los Angeles</h2>
            <div className="space-y-4 text-gray-700">
                <p>
                   Based in the vibrant city of Los Angeles, we are a dedicated team of graphic and video professionals bringing over 18 years of industry experience to the table.
                </p>
                <p>
                   Our passion lies in crafting compelling visual content that not only captures attention but also strategically helps businesses achieve their unique goals.
                </p>
            </div>
          </div>
          <PlaceholderImage className="w-full h-64 md:h-80 rounded-lg shadow-md" />
        </div>
      </section>

      {/* AI Integration Section */}
      <section className="bg-gray-50 py-16 md:py-20 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <PlaceholderImage className="w-full h-64 md:h-80 rounded-lg shadow-md order-last md:order-first" />
          <div>
             <span className="text-primary font-semibold mb-2 block">Innovation at Core</span>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Integrating Cutting-Edge AI</h2>
            <div className="space-y-4 text-gray-700">
                <p>
                   In today's rapidly evolving digital landscape, we stay ahead of the curve by integrating cutting-edge technology into our workflow.
                </p>
                <p>
                    Our team includes AI specialists, enabling us to leverage the power of artificial intelligence to deliver innovative solutions and elevate our creative output to an entirely new level.
                </p>
                <p>
                   We are committed to providing exceptional service and results that drive success for our clients.
                </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Offering Section */}
       <section className="py-16 md:py-20 px-4">
         <div className="container mx-auto text-center">
            <span className="text-primary font-semibold mb-2 block">Our Commitment</span>
           <h2 className="text-3xl font-semibold mb-10 text-gray-800">Empowering Brands Through Design</h2>
           <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             {/* Mission */}
             <div className="text-center p-6 border rounded-lg bg-white shadow-sm">
               <Target className="h-10 w-10 text-primary mx-auto mb-4" />
               <h3 className="text-xl font-medium mb-2">Our Mission</h3>
               <p className="text-gray-600 text-sm">To provide businesses with high-impact visual content and strategic design solutions that drive growth and achieve specific goals.</p>
             </div>
             {/* Offering */}
             <div className="text-center p-6 border rounded-lg bg-white shadow-sm">
               <Cpu className="h-10 w-10 text-primary mx-auto mb-4" />
               <h3 className="text-xl font-medium mb-2">Our Offering</h3>
               <p className="text-gray-600 text-sm">Unlimited graphic design and video services powered by experienced professionals and enhanced by AI for a flat monthly fee.</p>
             </div>
             {/* Approach */}
             <div className="text-center p-6 border rounded-lg bg-white shadow-sm">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
               <h3 className="text-xl font-medium mb-2">Our Approach</h3>
               <p className="text-gray-600 text-sm">A dedicated team approach focused on understanding your brand, delivering quickly, and ensuring your satisfaction.</p>
             </div>
           </div>
         </div>
       </section>


      {/* Final CTA Section */}
      <section className="bg-primary/10 py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">Ready to Partner With Us?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            See how our unique blend of experience and innovation can help your brand succeed.
          </p>
          <Link href="/pricing">
            <Button size="lg">
              View Our Plans <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
} 