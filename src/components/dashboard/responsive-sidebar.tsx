'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Settings,
  CreditCard,
  Image,
  MessageSquare,
  History,
  Bell,
  Palette,
  LogOut,
  ChevronRight,
  ChevronDown,
  User,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
  isAdmin?: boolean;
  badge?: number | null;
}

export function ResponsiveSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const isAdmin = session?.user?.role === 'ADMIN';
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleItem = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (href: string) => pathname === href;
  const isItemExpanded = (title: string) => expandedItems.includes(title);

  // Close sidebar when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fetch unread message count
  useEffect(() => {
    if (session?.user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch('/api/messages');
          if (response.ok) {
            const messages = await response.json();
            const unreadCount = messages.filter(
              (msg: any) => !msg.isRead && 
              (msg.recipientId === session.user?.id || 
              (isAdmin && !msg.isFromAdmin))
            ).length;
            
            setUnreadMessageCount(unreadCount);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchUnreadCount();
      
      // Refresh count every minute
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [session, isAdmin]);

  const navItems: NavItem[] = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Design Requests',
      href: '/dashboard/requests',
      icon: FileText,
      children: [
        {
          title: 'All Requests',
          href: '/dashboard/requests',
          icon: FileText,
        },
        {
          title: 'New Request',
          href: '/dashboard/requests/new',
          icon: PlusCircle,
        },
      ],
    },
    {
      title: 'My Designs',
      href: '/dashboard/designs',
      icon: Image,
    },
    {
      title: 'Messages',
      href: '/dashboard/messages',
      icon: MessageSquare,
      badge: unreadMessageCount > 0 ? unreadMessageCount : null,
    },
    {
      title: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCard,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
    {
      title: 'Admin',
      href: '/dashboard/admin',
      icon: Users,
      isAdmin: true,
      children: [
        {
          title: 'Users',
          href: '/dashboard/admin/users',
          icon: Users,
        },
        {
          title: 'Requests',
          href: '/dashboard/admin/requests',
          icon: FileText,
        },
        {
          title: 'Analytics',
          href: '/dashboard/admin/analytics',
          icon: LayoutDashboard,
        },
      ],
    },
  ];

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <div className="hidden md:flex h-full bg-white overflow-hidden flex-col">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Palette className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Design Service</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          // Skip admin items for non-admin users
          if (item.isAdmin && !isAdmin) {
            return null;
          }
          
          return (
            <div key={item.title}>
              {item.children ? (
                <div className="mb-2">
                  <button
                    onClick={() => toggleItem(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100",
                      pathname.startsWith(item.href) && "bg-gray-100 text-primary"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    {isItemExpanded(item.title) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isItemExpanded(item.title) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.title}
                          href={child.href}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100",
                            isItemActive(child.href) && "bg-gray-100 text-primary"
                          )}
                        >
                          <child.icon className="mr-3 h-4 w-4" />
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 mb-2",
                    isItemActive(item.href) && "bg-gray-100 text-primary"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.title}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <Badge 
                      className="ml-auto bg-red-500 text-white" 
                      variant="outline"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            {session?.user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 truncate">
            <div className="font-medium truncate">{session?.user?.name || 'User'}</div>
            <div className="text-xs text-muted-foreground truncate">{session?.user?.email || ''}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href="/api/auth/signout">
              <LogOut className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );

  // Custom Mobile Sidebar
  const MobileSidebar = () => (
    <div className="md:hidden">
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-xl transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <Palette className="h-5 w-5 text-primary" />
                <span className="font-semibold">Design Service</span>
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation - using a regular div with overflow-auto instead of ScrollArea */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                // Skip admin items for non-admin users
                if (item.isAdmin && !isAdmin) {
                  return null;
                }
                
                return (
                  <div key={item.title}>
                    {item.children ? (
                      <div className="mb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(item.title);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100",
                            pathname.startsWith(item.href) && "bg-gray-100 text-primary"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </div>
                          {isItemExpanded(item.title) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        {isItemExpanded(item.title) && (
                          <div className="ml-8 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.title}
                                href={child.href}
                                className={cn(
                                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100",
                                  isItemActive(child.href) && "bg-gray-100 text-primary"
                                )}
                                onClick={() => setIsOpen(false)}
                              >
                                <child.icon className="mr-3 h-4 w-4" />
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 mb-2",
                          isItemActive(item.href) && "bg-gray-100 text-primary"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.title}</span>
                        {item.badge !== undefined && item.badge !== null && (
                          <Badge 
                            className="ml-auto bg-red-500 text-white" 
                            variant="outline"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 truncate">
                <div className="font-medium truncate">{session?.user?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground truncate">{session?.user?.email || ''}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <Link href="/api/auth/signout">
                  <LogOut className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
} 