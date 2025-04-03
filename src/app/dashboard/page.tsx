'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  PlusCircle, 
  FileText, 
  FileClock, 
  Clock, 
  CheckCircle, 
  Palette,
  Image,
  Activity,
  Zap,
  Settings,
  CreditCard,
  BarChart4
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    inProgressRequests: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [status, session]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/design-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data);
      
      // Calculate stats
      const completed = data.filter((req: any) => req.status === 'COMPLETED').length;
      const pending = data.filter((req: any) => req.status === 'PENDING').length;
      const inProgress = data.filter((req: any) => req.status === 'IN_PROGRESS').length;
      const total = data.length;
      
      setStats({
        totalRequests: total,
        pendingRequests: pending,
        completedRequests: completed,
        inProgressRequests: inProgress,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Always show dashboard regardless of status
  return (
    <>
      {status === 'authenticated' ? (
        <div className="space-y-8">
          {/* Welcome header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'Designer'}
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's an overview of your design services and requests
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => router.push('/dashboard/requests/new')}
                className="flex items-center"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  All time design requests
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <FileClock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting designer review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgressRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Currently being worked on
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for download
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Completion progress */}
          <Card>
            <CardHeader>
              <CardTitle>Design Completion Progress</CardTitle>
              <CardDescription>
                Overall progress of your design requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall completion</span>
                  <span className="font-medium">{stats.completionRate}%</span>
                </div>
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick actions and Recent requests */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/requests/new')}>
                  <Palette className="mr-2 h-4 w-4" />
                  Create New Design Request
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/designs')}>
                  <Image className="mr-2 h-4 w-4" />
                  View My Designs
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/requests')}>
                  <Activity className="mr-2 h-4 w-4" />
                  Manage All Requests
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/billing')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing & Subscription
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>

            {/* Recent requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Recent Requests</CardTitle>
                  <CardDescription>Your latest design submissions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/requests')}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Zap className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground font-medium">No requests yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first design request to get started
                    </p>
                    <Button 
                      className="mt-4" 
                      size="sm"
                      onClick={() => router.push('/dashboard/requests/new')}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.slice(0, 3).map((request: any) => (
                      <div 
                        key={request.id} 
                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/requests/${request.id}`)}
                      >
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            request.status === 'COMPLETED' ? 'bg-green-500' :
                            request.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-amber-500'
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{request.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100">
                          {request.status === 'COMPLETED' ? 'Completed' :
                           request.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subscription status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>Your current plan and usage</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/billing')}>
                Manage Subscription
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {session?.user?.subscriptionStatus === 'active' ? 'Premium Plan' : 'Free Plan'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {session?.user?.subscriptionStatus === 'active' 
                      ? 'Unlimited design requests' 
                      : 'Limited to 3 design requests'}
                  </p>
                </div>
                <div className="flex items-center">
                  <BarChart4 className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <p className="text-sm font-medium">{stats.totalRequests} / {session?.user?.subscriptionStatus === 'active' ? '∞' : '3'}</p>
                    <p className="text-xs text-muted-foreground">Requests used</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              You need to be signed in to view this dashboard. Please sign in to continue.
            </p>
            <Button onClick={() => router.push('/signin')}>
              Sign In Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
} 