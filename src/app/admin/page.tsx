"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  MessageSquare,
  FileText,
  Package,
  Star,
  Timer, 
  Check,
  ArrowRight 
} from "lucide-react";
import { useState, useEffect } from "react"; 
import { format } from 'date-fns'; 

// Define the structure for the fetched stats (including recent data)
interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  pendingDesignRequests: number;
  completedDesignRequests: number;
  recentUsers: { id: string; name: string | null; email: string | null; createdAt: Date }[];
  recentPendingRequests: { id: string; title: string; createdAt: Date; user: { name: string | null; email: string | null } }[];
}

export default function AdminDashboardPage() { // Renamed component slightly for clarity
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true); // Start loading initially
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch stats when the component mounts
  useEffect(() => {
      const fetchStats = async () => {
        setIsLoadingStats(true);
        setStatsError(null);
        try {
          const response = await fetch('/api/admin/stats');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          const parsedData: AdminStats = {
             ...data,
             recentUsers: data.recentUsers.map((user: any) => ({ ...user, createdAt: new Date(user.createdAt) })),
             recentPendingRequests: data.recentPendingRequests.map((req: any) => ({ ...req, createdAt: new Date(req.createdAt) }))
           };
           setStats(parsedData);
        } catch (error) {
          console.error("Failed to fetch admin stats:", error);
          const message = error instanceof Error ? error.message : "Failed to load stats";
          setStatsError(message);
        } finally {
          setIsLoadingStats(false);
        }
      };
      fetchStats();
  }, []); // Empty dependency array means fetch only on mount

  // Session loading and admin check (can be simplified if layout/middleware handles it robustly)
  if (status === "loading") {
    return <div className="flex justify-center items-center h-64">Loading session...</div>;
  }
  if (!session?.user || session.user.role !== "ADMIN") {
     if (typeof window !== 'undefined') { redirect("/"); } // Redirect if on client
     return null; // Render nothing while redirecting
  }

  // Helper functions remain the same
  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  const formatDate = (date: Date | undefined) => {
      if (!date) return 'N/A';
      return format(date, 'PP');
  }

  return (
    // Return only the dashboard-specific content, layout is handled by layout.tsx
      <div className="space-y-8"> 
          {/* Error display */}
          {statsError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{statsError}</span>
              </div>
          )}
          
          {/* Quick Stats Row */}  
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
             {/* Cards using fetched data or loading state */}
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
               <CardContent><div className="text-2xl font-bold">{isLoadingStats ? "..." : stats?.totalUsers ?? 'N/A'}</div></CardContent>
             </Card>
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader>
               <CardContent><div className="text-2xl font-bold">{isLoadingStats ? "..." : stats?.activeSubscriptions ?? 'N/A'}</div></CardContent>
             </Card>
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Monthly Revenue (MRR)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
               <CardContent><div className="text-2xl font-bold">{isLoadingStats ? "..." : stats ? formatCurrency(stats.monthlyRecurringRevenue) : 'N/A'}</div></CardContent>
             </Card>
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Requests</CardTitle><Timer className="h-4 w-4 text-muted-foreground" /></CardHeader>
               <CardContent><div className="text-2xl font-bold">{isLoadingStats ? "..." : stats?.pendingDesignRequests ?? 'N/A'}</div></CardContent>
             </Card>
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Completed Requests</CardTitle><Check className="h-4 w-4 text-muted-foreground" /></CardHeader>
               <CardContent><div className="text-2xl font-bold">{isLoadingStats ? "..." : stats?.completedDesignRequests ?? 'N/A'}</div></CardContent>
             </Card>
           </div>

          {/* Recent Data & Actions Row */}  
          <div className="grid gap-8 lg:grid-cols-3">
             {/* Recent Pending Requests Card */}
             <Card className="lg:col-span-1">
               <CardHeader><CardTitle>Recent Pending Requests</CardTitle></CardHeader>
               <CardContent>
                 {isLoadingStats && <p>Loading...</p>}
                 {!isLoadingStats && stats?.recentPendingRequests && stats.recentPendingRequests.length > 0 ? (
                   <ul className="space-y-3">
                     {stats.recentPendingRequests.map(req => (
                       <li key={req.id} className="text-sm border-b pb-2 last:border-b-0">
                         <p className="font-medium truncate">{req.title}</p>
                         <p className="text-xs text-muted-foreground">By: {req.user.name || req.user.email || 'Unknown'}</p>
                         <p className="text-xs text-muted-foreground">Received: {formatDate(req.createdAt)}</p>
                       </li>
                     ))}
                   </ul>
                 ) : (
                   !isLoadingStats && <p className="text-sm text-muted-foreground">No pending requests.</p>
                 )}
                 <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                     <Link href="/admin/requests">View All Pending Requests <ArrowRight className="ml-2 h-4 w-4" /></Link>
                 </Button>
               </CardContent>
             </Card>
             
             {/* Recent Signups Card */}
             <Card className="lg:col-span-1">
               <CardHeader><CardTitle>Recent Signups</CardTitle></CardHeader>
               <CardContent>
                 {isLoadingStats && <p>Loading...</p>}
                 {!isLoadingStats && stats?.recentUsers && stats.recentUsers.length > 0 ? (
                   <ul className="space-y-3">
                     {stats.recentUsers.map(user => (
                       <li key={user.id} className="text-sm border-b pb-2 last:border-b-0">
                         <p className="font-medium truncate">{user.name || user.email || 'No name'}</p>
                         <p className="text-xs text-muted-foreground">Email: {user.email || 'N/A'}</p>
                         <p className="text-xs text-muted-foreground">Joined: {formatDate(user.createdAt)}</p>
                       </li>
                     ))}
                   </ul>
                 ) : (
                    !isLoadingStats && <p className="text-sm text-muted-foreground">No recent signups.</p>
                 )}
                  <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                     <Link href="/admin/customers">Manage All Customers <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
               </CardContent>
             </Card>

             {/* Quick Actions Card */}
             <Card className="lg:col-span-1">
               <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
               <CardContent className="space-y-3">
                 <Button className="w-full justify-start" variant="ghost" asChild>
                     <Link href="/admin/requests"><FileText className="mr-2 h-4 w-4" /> Manage Design Requests</Link>
                 </Button>
                 <Button className="w-full justify-start" variant="ghost" asChild>
                     <Link href="/admin/customers"><Users className="mr-2 h-4 w-4" /> Manage Customers</Link>
                 </Button>
                 <Button className="w-full justify-start" variant="ghost" asChild>
                     <Link href="/admin/services"><Package className="mr-2 h-4 w-4" /> Manage Services</Link>
                 </Button>
                 <Button className="w-full justify-start" variant="ghost" asChild>
                     <Link href="/admin/messages"><MessageSquare className="mr-2 h-4 w-4" /> View Messages</Link>
                 </Button>
                 <Button className="w-full justify-start" variant="ghost" asChild>
                     <Link href="/admin/settings"><Settings className="mr-2 h-4 w-4" /> Admin Settings</Link>
                 </Button>
               </CardContent>
             </Card>
           </div>
      </div>
  );
} 