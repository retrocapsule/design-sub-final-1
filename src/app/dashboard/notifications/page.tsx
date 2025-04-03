'use client';

import React from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Design Completed',
        message: 'Your logo design has been completed and is ready for review.',
        type: 'success',
        timestamp: '2024-03-20T10:30:00',
        isRead: false,
        action: {
          label: 'View Design',
          href: '/dashboard/designs/1',
        },
      },
      {
        id: '2',
        title: 'Payment Successful',
        message: 'Your subscription payment has been processed successfully.',
        type: 'success',
        timestamp: '2024-03-19T15:45:00',
        isRead: true,
      },
      {
        id: '3',
        title: 'Subscription Expiring',
        message: 'Your subscription will expire in 7 days. Please renew to continue using our services.',
        type: 'warning',
        timestamp: '2024-03-18T09:15:00',
        isRead: false,
        action: {
          label: 'Renew Now',
          href: '/dashboard/billing',
        },
      },
      {
        id: '4',
        title: 'System Update',
        message: 'We\'ve made some improvements to our platform. Check out the new features!',
        type: 'info',
        timestamp: '2024-03-17T14:20:00',
        isRead: true,
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  const filteredNotifications = notifications.filter(notification =>
    filter === 'all' || !notification.isRead
  );

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true,
    })));
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Notifications"
        description="Stay updated with your design requests and account activity"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Notifications</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
            >
              Unread
            </Button>
            <Button variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  notification.isRead ? 'bg-background' : 'bg-muted/50'
                }`}
              >
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {notification.action && (
                    <Button
                      variant="link"
                      className="px-0 h-auto mt-2"
                      onClick={() => {
                        // TODO: Implement navigation
                        console.log('Navigate to:', notification.action?.href);
                      }}
                    >
                      {notification.action.label}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 