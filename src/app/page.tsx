"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/layout/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Star, Zap, Clock, Users, Shield, ArrowRight, Instagram, Shirt, Palette, Megaphone, Store, Camera, Rocket, Play, ChevronRight, Sparkles, Wand2, Layers, Share2, Target, ArrowUpRight, TrendingUp, BarChart3, DollarSign, Award, HeartHandshake, Brain, ShieldCheck, Users2, Timer, CheckCircle, X, ShoppingBag, Mail, Image as ImageIcon, Video, FileText, Globe, Smartphone, Brush, PenTool, Layout, Type, Film, Music, BookOpen, Gamepad, Gift, Calendar, Clock2, Trophy, Medal, Crown, Diamond, Gem, Sparkle, Flame, Bolt, Sun, Moon, Printer } from 'lucide-react';
import { ExampleViewer } from "@/components/example-viewer";
import { examples } from "@/data/examples";
import { CaseStudyViewer } from "@/components/case-study-viewer";
import { caseStudies } from "@/data/case-studies";
import { useState } from "react";
import Footer from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [selectedExample, setSelectedExample] = useState<typeof examples[0] | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<typeof caseStudies[0] | null>(null);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);

  const handleViewExample = (example: typeof examples[0]) => {
    setSelectedExample(example);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedExample(null);
  };

  const handlePreviousExample = () => {
    if (!selectedExample) return;
    const currentIndex = examples.findIndex((e) => e.id === selectedExample.id);
    if (currentIndex > 0) {
      setSelectedExample(examples[currentIndex - 1]);
    }
  };

  const handleNextExample = () => {
    if (!selectedExample) return;
    const currentIndex = examples.findIndex((e) => e.id === selectedExample.id);
    if (currentIndex < examples.length - 1) {
      setSelectedExample(examples[currentIndex + 1]);
    }
  };

  const hasPreviousExample = selectedExample ? examples.findIndex((e) => e.id === selectedExample.id) > 0 : false;
  const hasNextExample = selectedExample ? examples.findIndex((e) => e.id === selectedExample.id) < examples.length - 1 : false;

  const handleViewCaseStudy = (caseStudy: typeof caseStudies[0]) => {
    setSelectedCaseStudy(caseStudy);
    setIsCaseStudyOpen(true);
  };

  const handleCloseCaseStudy = () => {
    setIsCaseStudyOpen(false);
    setSelectedCaseStudy(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. Navigation */}
      <Navigation />
      
      {/* 2. Hero Section with Pain Point Focus */}
      <section className="relative py-12 sm:py-16 md:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/90 z-10" />
        <div className="absolute inset-0 bg-[url('/images/hero_bg.png')] bg-cover bg-center blur-sm z-0" />
        
        {/* Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
        
        <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 gap-8 sm:gap-12 items-center">
              {/* Left Column - Pain Point & Solution - Now Centered */}
              <div className="text-center">
                <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-500 text-white shadow mb-4 sm:mb-6">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm font-medium">Launch Special - 50% Off First 3 Months</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
                  Get Unlimited Designs
                  <span className="text-primary block mt-1 sm:mt-2">For One Flat Rate</span>
                </h1>
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex flex-col items-center">
                  <p className="text-lg sm:text-xl text-muted-foreground">
                    Stop paying $100+ per design. Get unlimited designs, revisions, and support for just $199/month.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base sm:text-lg">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span>48-Hour Delivery</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span>Unlimited Revisions</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base sm:text-lg">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span>All Design Types</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span>Money-Back Guarantee</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-primary hover:bg-primary/90">
                      Start Your First Design
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground justify-center">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current mr-1" />
                    <span>4.6 stars from 600+ customers</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary mr-1" />
                    <span>100% Satisfaction Guaranteed</span>
                  </div>
                </div>
              </div>
              
              {/* Right Column - PNG Image - REMOVED */}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Design Examples Service Showcase with Tabs */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Our Design Services</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional designs for every creative need
            </p>
          </div>

          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid w-full grid-cols-6 gap-0 mb-6 sm:mb-8 h-auto">
              <TabsTrigger value="social" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1">
                <Instagram className="h-4 w-4" />
                <span className="hidden sm:inline">Social</span>
              </TabsTrigger>
              <TabsTrigger value="merch" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1">
                <Shirt className="h-4 w-4" />
                <span className="hidden sm:inline">Merch</span>
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Branding</span>
              </TabsTrigger>
              <TabsTrigger value="marketing" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1">
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">Marketing</span>
              </TabsTrigger>
              <TabsTrigger value="web" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Web</span>
              </TabsTrigger>
              <TabsTrigger value="print" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examples
                  .filter((example) => example.category === "social")
                  .map((example) => (
                    <div
                      key={example.id}
                      className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={example.image}
                          alt={example.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="text-base sm:text-lg font-semibold">{example.title}</h3>
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">{example.description}</p>
                        <Button
                          variant="outline"
                          className="mt-3 sm:mt-4 w-full text-sm sm:text-base py-1.5 sm:py-2"
                          onClick={() => handleViewExample(example)}
                        >
                          View Example
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="merch" className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examples
                  .filter((example) => example.category === "merch")
                  .map((example) => (
                    <div
                      key={example.id}
                      className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={example.image}
                          alt={example.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{example.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{example.description}</p>
                        <Button
                          variant="outline"
                          className="mt-4 w-full"
                          onClick={() => handleViewExample(example)}
                        >
                          View Example
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examples
                  .filter((example) => example.category === "branding")
                  .map((example) => (
                    <div
                      key={example.id}
                      className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={example.image}
                          alt={example.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{example.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{example.description}</p>
                        <Button
                          variant="outline"
                          className="mt-4 w-full"
                          onClick={() => handleViewExample(example)}
                        >
                          View Example
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="marketing" className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examples
                  .filter((example) => example.category === "marketing")
                  .map((example) => (
                    <div
                      key={example.id}
                      className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={example.image}
                          alt={example.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{example.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{example.description}</p>
                        <Button
                          variant="outline"
                          className="mt-4 w-full"
                          onClick={() => handleViewExample(example)}
                        >
                          View Example
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="web" className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examples
                  .filter((example) => example.category === "web")
                  .map((example) => (
                    <div
                      key={example.id}
                      className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={example.image}
                          alt={example.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{example.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{example.description}</p>
                        <Button
                          variant="outline"
                          className="mt-4 w-full"
                          onClick={() => handleViewExample(example)}
                        >
                          View Example
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="print" className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examples
                  .filter((example) => example.category === "print")
                  .map((example) => (
                    <div
                      key={example.id}
                      className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={example.image}
                          alt={example.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{example.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{example.description}</p>
                        <Button
                          variant="outline"
                          className="mt-4 w-full"
                          onClick={() => handleViewExample(example)}
                        >
                          View Example
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 4. How It Works Section - N/A, seems to be missing or part of another section */}

      {/* 5. Comparison - Problem vs Solution Section with Visual Comparison */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Design Industry is Broken</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              See how we're revolutionizing the design industry
          </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Cost Comparison Chart */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Cost Comparison</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-medium">Traditional Designers</span>
            </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-red-500">$100+</span>
                    <span className="ml-1 text-xs sm:text-sm text-muted-foreground">/design</span>
            </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-medium">Freelance Platforms</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-500">$20-50</span>
                    <span className="ml-1 text-xs sm:text-sm text-muted-foreground">/design</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-medium">Our Service</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-500">$0</span>
                    <span className="ml-1 text-xs sm:text-sm text-muted-foreground">/design</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 p-4 bg-green-50 rounded-lg">
                <p className="text-sm sm:text-base text-green-700 font-medium">
                  Save up to 90% on design costs with our unlimited subscription model
                </p>
            </div>
          </div>

            {/* Time Comparison Chart */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Time to Delivery</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-medium">Traditional Designers</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-red-500">1-2 weeks</span>
                    <span className="ml-1 text-xs sm:text-sm text-muted-foreground">/design</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-medium">Freelance Platforms</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-500">3-5 days</span>
                    <span className="ml-1 text-xs sm:text-sm text-muted-foreground">/design</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-medium">Our Service</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-500">24 hours</span>
                    <span className="ml-1 text-xs sm:text-sm text-muted-foreground">/design</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 p-4 bg-green-50 rounded-lg">
                <p className="text-sm sm:text-base text-green-700 font-medium">
                  Get designs 6x faster with our dedicated team
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Case Studies Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect For Your Business</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how different businesses use our service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((caseStudy) => (
              <div
                key={caseStudy.id}
                className="group relative overflow-hidden rounded-2xl border bg-card hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={caseStudy.image}
                    alt={caseStudy.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold mb-4">{caseStudy.title}</h3>
                  <p className="text-muted-foreground mb-4">{caseStudy.description}</p>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">{caseStudy.results.title}</span>
                      <span className="text-2xl font-bold text-primary">{caseStudy.results.value}</span>
                    </div>
                    {caseStudy.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between mb-2">
                        <span className="text-sm">{metric.title}</span>
                        <span className="font-semibold">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleViewCaseStudy(caseStudy)}
                  >
                    View Case Study
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Key Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Scale</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join 2,000+ creators who trust us with their design needs
            </p>
          </div>
          
          {/* New Alternating Blocks Layout */}
          <div className="space-y-16 md:space-y-24">

            {/* Feature 1: Unlimited Designs (Text Left, Visual Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="flex flex-col md:items-end md:text-right"> { /* Text Content - Aligned Right on MD+ */ }
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-5">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">Unlimited Designs</h3>
                <p className="text-lg text-muted-foreground">
                  Stack your design queue infinitely; we deliver polished results one after another. Focus on your vision, not request limits.
                </p>
              </div>
              <div className="aspect-video bg-gradient-to-br from-muted to-slate-200 rounded-lg shadow-md">
                {/* Placeholder for image/illustration */}
              </div>
            </div>

            {/* Feature 2: 48-Hour Delivery (Visual Left, Text Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="aspect-video bg-gradient-to-br from-muted to-slate-200 rounded-lg shadow-md order-last md:order-first"> { /* Added order-last for mobile */ }
                {/* Placeholder for image/illustration */} 
              </div>
              <div className="flex flex-col md:items-start md:text-left order-first md:order-last"> { /* Added order-first for mobile. Text Content - Aligned Left on MD+ */ }
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-5">
                  <Timer className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">48-Hour Delivery</h3>
                <p className="text-lg text-muted-foreground">
                  Get your designs back within 48 hours, typically. Fast turnaround helps you keep momentum on your projects.
                </p>
              </div>
            </div>

            {/* Feature 3: Money-Back Guarantee (Text Left, Visual Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="flex flex-col md:items-end md:text-right"> { /* Text Content - Aligned Right on MD+ */ }
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-5">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">Money-Back Guarantee</h3>
                <p className="text-lg text-muted-foreground">
                  Not satisfied with your initial designs? We offer a guarantee for peace of mind. See our terms for details.
                </p>
              </div>
              <div className="aspect-video bg-gradient-to-br from-muted to-slate-200 rounded-lg shadow-md">
                {/* Placeholder for image/illustration */} 
              </div>
            </div>

          </div> { /* End Alternating Blocks */ }
        </div>
      </section>

      {/* 10. Testimonials Section - REMOVED FROM HERE */}

      {/* 8. Pricing Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 rounded-2xl border bg-card">
              <h3 className="text-2xl font-bold mb-4">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Unlimited Design Requests</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>24-Hour Delivery</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Basic Support</span>
                </li>
              </ul>
              <Link href="/pricing">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="p-8 rounded-2xl border bg-card relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Advanced Features</span>
                </li>
              </ul>
              <Link href="/pricing">
                <Button className="w-full bg-primary hover:bg-primary/90">Level Up</Button>
              </Link>
            </div>
            
            {/* Enterprise Plan */}
            <div className="p-8 rounded-2xl border bg-card">
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$499</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Dedicated Support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>Custom Solutions</span>
                </li>
              </ul>
              <Link href="/pricing">
                <Button className="w-full">Go Big</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Scarcity Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/scarcity-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-purple-600/90" />
        <div className="absolute inset-0 bg-[url('/images/textures/tile-pattern.png')] bg-repeat" />
        
        <div className="container relative mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white mb-6">
            <Timer className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Limited Time Offer</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Only 5 Spots Left at This Price</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 opacity-90">
            Join our exclusive group of creators and save 50% on your first 3 months.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">3</div>
              <p className="text-white/80">Spots Left at $99/mo</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">2</div>
              <p className="text-white/80">Spots Left at $199/mo</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">1</div>
              <p className="text-white/80">Spot Left at $499/mo</p>
            </div>
          </div>

          <Link href="/pricing">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6">
              Claim Your Spot Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 10. Testimonials Section - MOVED HERE */}
      <section id="proof" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Results From Real Clients</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how our clients transformed their businesses
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary to-primary/20"></div>
            
            {/* Success Story 1 */}
            <div className="relative mb-16">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 md:pr-8 text-right">
                  <div className="bg-card p-8 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-end mb-4">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Cincoro Tequila</h3>
                    <div className="flex items-center justify-end mb-4">
                      <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                      <span className="text-xl font-semibold">Elevated Social Presence</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      "Maintaining a high-end aesthetic across all social channels requires top-tier design, delivered quickly. DesignSub consistently provides the state-of-the-art graphics we need to keep our brand presence sharp and engaging online."
                    </p>
                    <div className="flex items-center justify-end text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Impact within 1 Quarter</span>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-8">
                  <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">+40%</div>
                        <div className="text-sm text-muted-foreground">Social Engagement Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">+15%</div>
                        <div className="text-sm text-muted-foreground">Follower Growth Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Story 2 */}
            <div className="relative mb-16">
              <div className="flex flex-col-reverse md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 md:pr-8">
                  <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">100+</div>
                        <div className="text-sm text-muted-foreground">Graphics Delivered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">98%</div>
                        <div className="text-sm text-muted-foreground">Brand Guideline Adherence</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-8">
                  <div className="bg-card p-8 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Boston Celtics</h3>
                    <div className="flex items-center mb-4">
                      <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                      <span className="text-xl font-semibold">Unified Game Day Experience</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      "Creating engaging Jumbotron graphics for every game and event is a huge task. DesignSub became our go-to partner, consistently providing high-quality visuals that unified our brand story on and off the court."
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Impact Within a Season</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Story 3 */}
            <div className="relative">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 md:pr-8 text-right">
                  <div className="bg-card p-8 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-end mb-4">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                        <Star className="h-5 w-5 fill-current" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Empire Records</h3>
                    <div className="flex items-center justify-end mb-4">
                      <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                      <span className="text-xl font-semibold">Streamlined Weekly Releases</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      "Juggling cover art and promo graphics for weekly releases across our artist roster is demanding. DesignSub's subscription model gives us the bandwidth to get professional, on-brand visuals for every single release, without the per-piece hassle."
                    </p>
                    <div className="flex items-center justify-end text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Ongoing Partnership</span>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-8">
                  <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">50+</div>
                        <div className="text-sm text-muted-foreground">Artworks Delivered Monthly</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">100%</div>
                        <div className="text-sm text-muted-foreground">Release Deadlines Met</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Guarantees Section / Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/cta-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-purple-600/90" />
        
        <div className="container relative mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white mb-6">
            <Timer className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Limited Time Offer - Save 50%</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Brand?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 opacity-90">
            Join thousands of creators who are already making their mark with our design service.
          </p>
          <Link href="/pricing">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 12. Footer - REMOVED HARDCODED FOOTER */}
      {/* The hardcoded footer section previously here is now removed */}

      {/* Use the Footer component instead */}
      <Footer /> 

      {/* Add the ExampleViewer component or Dialog logic here if needed */}
      {/* Example using Shadcn Dialog (ensure imports are correct) */}
      {selectedExample && (
        <Dialog open={!!selectedExample} onOpenChange={(isOpen) => !isOpen && setSelectedExample(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedExample.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <img src={selectedExample.image} alt={selectedExample.description} className="rounded-lg w-full object-cover" />
              <p className="text-sm text-muted-foreground mt-2">{selectedExample.description}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add the CaseStudyViewer component */}
      {selectedCaseStudy && (
        <CaseStudyViewer
          isOpen={isCaseStudyOpen}
          onClose={handleCloseCaseStudy}
          caseStudy={selectedCaseStudy}
        />
      )}
    </div>
  );
}
