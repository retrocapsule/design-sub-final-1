'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DesignRequest {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REVISIONS_REQUESTED';
  createdAt: string;
}

export function RecentRequests() {
  const [requests, setRequests] = useState<DesignRequest[]>([]);

  useEffect(() => {
    // TODO: Fetch real data from API
    // This is temporary mock data
    setRequests([
      {
        id: '1',
        title: 'Website Banner Design',
        status: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Social Media Graphics',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Logo Design',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const getStatusColor = (status: DesignRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'REVISIONS_REQUESTED':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Recent Requests</CardTitle>
        <Link href="/dashboard/requests">
          <Button variant="ghost" size="sm">View all</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{request.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <Badge className={getStatusColor(request.status)}>
                {request.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 