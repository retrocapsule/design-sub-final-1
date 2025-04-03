'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data - would be fetched from API in real app
const customerData = {
  total: 78,
  active: 65,
  inactive: 13,
  recentJoins: 8,
};

export function CustomerOverview() {
  return (
    <Card>
      <CardHeader className="bg-slate-50">
        <CardTitle>Customer Overview</CardTitle>
        <CardDescription>Summary of your customer accounts</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">{customerData.total}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
            <p className="text-2xl font-bold">{customerData.active}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Inactive Accounts</p>
            <p className="text-2xl font-bold">{customerData.inactive}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">New This Month</p>
            <p className="text-2xl font-bold">{customerData.recentJoins}</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Recent Customers</h3>
          <div className="space-y-4">
            {/* Mock data - would be fetched from API */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-slate-700 font-medium">JD</span>
                </div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">john@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                <p className="text-sm text-muted-foreground">Pro Plan</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-slate-700 font-medium">JS</span>
                </div>
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-muted-foreground">jane@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                <p className="text-sm text-muted-foreground">Enterprise Plan</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-slate-700 font-medium">RJ</span>
                </div>
                <div>
                  <p className="font-medium">Robert Johnson</p>
                  <p className="text-sm text-muted-foreground">robert@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Trial</span>
                <p className="text-sm text-muted-foreground">Basic Plan</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50">
        <Link href="/admin/customers" className="w-full">
          <Button variant="outline" className="w-full">View All Customers</Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 