'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Menu, 
  X, 
  Palette, 
  LayoutDashboard,
  FileText,
  PlusCircle,
  MessageSquare,
  User,
  LayoutList,
  Users,
  Settings,
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const isAdmin = session?.user?.role === 'ADMIN';

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

  // This effect allows us to lock the body scroll when the menu is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    // Cleanup
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: 'My Requests',
      href: '/dashboard/requests',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: 'New Request',
      href: '/dashboard/requests/new',
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      title: 'Messages',
      href: '/dashboard/messages',
      icon: <MessageSquare className="h-4 w-4" />,
      badge: unreadMessageCount > 0 ? unreadMessageCount : null,
    },
    {
      title: 'Account',
      href: '/dashboard/account',
      icon: <User className="h-4 w-4" />,
    },
  ];

  const adminItems = [
    {
      title: 'All Requests',
      href: '/dashboard/admin/requests',
      icon: <LayoutList className="h-4 w-4" />,
    },
    {
      title: 'Users',
      href: '/dashboard/admin/users',
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: 'Settings',
      href: '/dashboard/admin/settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                  <Palette className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Design Requests</span>
                </Link>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                      {item.badge && (
                        <Badge 
                          className="ml-auto bg-red-500 hover:bg-red-600 text-white" 
                          variant="outline"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                ))}

                {isAdmin && (
                  <>
                    <div className="my-2 px-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Admin
                      </div>
                    </div>
                    {adminItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={() => setOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </Button>
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {session?.user?.name ? (
                    session.user.name[0]
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email || ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  asChild
                >
                  <Link href="/api/auth/signout">
                    <LogOut className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 