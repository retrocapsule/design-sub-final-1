"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Define public pages
  const publicPages = ['/', '/pricing', '/signup', '/signin'];
  const isPublicPage = publicPages.includes(pathname);
  const isDashboardPage = pathname.startsWith('/dashboard');

  // Show navigation on public pages
  const shouldShowNav = isPublicPage;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Design Service</span>
          </Link>
        </div>

        {/* Navigation - show on public pages */}
        {shouldShowNav && (
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/pricing" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Pricing
            </Link>
          </nav>
        )}

        {/* Auth buttons - show on public pages */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {shouldShowNav && !session && (
            <>
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 