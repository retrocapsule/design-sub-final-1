'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  badge?: number | null;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
  isAdmin?: boolean;
  badge?: number | null;
}

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
    badge: null,
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

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const isAdmin = session?.user?.role === 'ADMIN';
  // Store expanded state for collapsible items
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleItem = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (href: string) => pathname === href;

  const isItemExpanded = (title: string) => expandedItems.includes(title);

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

  // Regular user links
  const userLinks: SidebarLink[] = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: <LayoutDashboard className="h-4 w-4" />,
      description: 'Overview of your requests',
    },
    {
      href: '/dashboard/requests',
      label: 'My Requests',
      icon: <FileText className="h-4 w-4" />,
      description: 'Manage your design requests',
    },
    {
      href: '/dashboard/requests/new',
      label: 'New Request',
      icon: <PlusCircle className="h-4 w-4" />,
      description: 'Create a new design request',
    },
    {
      href: '/dashboard/messages',
      label: 'Messages',
      icon: <MessageSquare className="h-4 w-4" />,
      description: 'Communication about your designs',
      badge: unreadMessageCount > 0 ? unreadMessageCount : null,
    },
    {
      href: '/dashboard/designs',
      label: 'My Designs',
      icon: <Image className="h-4 w-4" />,
      description: 'Access your completed designs',
    },
    {
      href: '/dashboard/billing',
      label: 'Billing',
      icon: <CreditCard className="h-4 w-4" />,
      description: 'Manage your subscription and billing',
    },
  ];

  // Admin-only links
  const adminLinks: SidebarLink[] = [
    {
      href: '/dashboard/users',
      label: 'Users',
      icon: <Users className="h-4 w-4" />,
      description: 'Manage user accounts',
    },
    {
      href: '/dashboard/activity',
      label: 'Activity',
      icon: <History className="h-4 w-4" />,
      description: 'View system activity and logs',
    },
  ];

  // Settings and notifications (available to all)
  const systemLinks: SidebarLink[] = [
    {
      href: '/dashboard/notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      description: 'Your notifications and alerts',
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      description: 'Account and preference settings',
    },
  ];

  const links = [...userLinks, ...(isAdmin ? adminLinks : []), ...systemLinks];

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
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
                  {item.href === '/dashboard/messages' && unreadMessageCount > 0 && (
                    <Badge 
                      className="ml-auto bg-red-500 text-white" 
                      variant="outline"
                    >
                      {unreadMessageCount}
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
        </div>
      </div>
    </div>
  );
} 