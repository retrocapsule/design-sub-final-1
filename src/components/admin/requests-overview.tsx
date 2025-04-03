'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data - would be fetched from API in real app
const requestsData = {
  pending: 12,
  inProgress: 8,
  completed: 45,
  revisions: 5,
  total: 70,
};

export function RequestsOverview() {
  return (
    <Card>
      <CardHeader className="bg-slate-50">
        <CardTitle>Design Requests Overview</CardTitle>
        <CardDescription>Summary of all design requests</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{requestsData.pending}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold">{requestsData.inProgress}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Revisions</p>
            <p className="text-2xl font-bold">{requestsData.revisions}</p>
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
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Recent Requests</h3>
          <div className="space-y-4">
            {/* Mock data - would be fetched from API */}
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Logo Design for Tech Startup</p>
                <p className="text-sm text-muted-foreground">John Doe • 2 days ago</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-amber-100 text-amber-700">Pending</span>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/admin/requests/1">View</Link>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Product Packaging Design</p>
                <p className="text-sm text-muted-foreground">Jane Smith • 1 day ago</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-blue-100 text-blue-700">In Progress</span>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/admin/requests/2">View</Link>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Social Media Banner Set</p>
                <p className="text-sm text-muted-foreground">Robert Johnson • 3 hours ago</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-purple-100 text-purple-700">Revision</span>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/admin/requests/3">View</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 flex justify-between">
        <Link href="/admin/requests" className="flex-1 mr-2">
          <Button variant="outline" className="w-full">View All Requests</Button>
        </Link>
        <Link href="/admin/requests/pending" className="flex-1 ml-2">
          <Button className="w-full">Pending Requests</Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 