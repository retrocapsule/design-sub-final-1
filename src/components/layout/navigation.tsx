'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const isAdmin = session?.user?.role === 'ADMIN';
  const isAuthenticated = status === 'authenticated';
  
  return (
    <header className="border-b">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-2xl">
            DesignSub
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm transition-colors ${
                pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className={`text-sm transition-colors ${
                pathname === '/pricing' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Pricing
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`text-sm transition-colors ${
                  pathname?.startsWith('/dashboard') ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm transition-colors ${
                  pathname?.startsWith('/admin') ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link href="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
                    <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    console.log('Signing out');
                    signOut({ callbackUrl: '/' });
                  }}
                  className="text-red-500 cursor-pointer"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
} 