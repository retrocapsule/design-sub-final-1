'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Stats {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  activeRequests: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    activeRequests: 0,
  });

  useEffect(() => {
    // TODO: Fetch real stats from API
    // This is temporary mock data
    setStats({
      totalRequests: 12,
      completedRequests: 5,
      pendingRequests: 3,
      activeRequests: 4,
    });
  }, []);

  const items = [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: 'Completed',
      value: stats.completedRequests,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Pending',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'In Progress',
      value: stats.activeRequests,
      icon: AlertCircle,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 