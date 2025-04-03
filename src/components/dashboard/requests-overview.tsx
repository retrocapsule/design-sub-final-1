'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data - would be fetched from API in real app
const requestsData = {
  pending: 2,
  inProgress: 1,
  completed: 5,
  total: 8,
};

export function RequestsOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Design Requests</CardTitle>
        <CardDescription>Overview of your design requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{requestsData.pending}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold">{requestsData.inProgress}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{requestsData.completed}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{requestsData.total}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full">
          <Link href="/dashboard/requests">
            <Button variant="outline">View All</Button>
          </Link>
          <Link href="/dashboard/requests/new">
            <Button>New Request</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
} 