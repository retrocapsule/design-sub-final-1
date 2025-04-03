'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  FileText,
  MessageSquare,
  CreditCard,
  Settings,
} from 'lucide-react';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      label: 'New Request',
      href: '/dashboard/new-request',
      icon: <PlusCircle className="h-4 w-4" />,
      description: 'Create a new design request',
    },
    {
      label: 'View Requests',
      href: '/dashboard/requests',
      icon: <FileText className="h-4 w-4" />,
      description: 'Check your existing requests',
    },
    {
      label: 'Messages',
      href: '/dashboard/messages',
      icon: <MessageSquare className="h-4 w-4" />,
      description: 'View your conversations',
    },
    {
      label: 'Billing',
      href: '/dashboard/billing',
      icon: <CreditCard className="h-4 w-4" />,
      description: 'Manage your subscription',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-auto flex flex-col items-center justify-center p-4 gap-2 hover:bg-muted"
              >
                {action.icon}
                <span className="text-sm font-medium">{action.label}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {action.description}
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 