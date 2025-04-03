'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, FileText, Ruler, Palette, MessageSquare, User, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface DesignRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projectType: string;
  fileFormat: string;
  dimensions: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  messages: {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
    user: {
      name: string;
      email: string;
    };
  }[];
  deliverables: {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
  assignedTo: {
    name: string;
    email: string;
  };
}

export default function RequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const checkSubscription = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const response = await fetch('/api/subscription/check');
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to check subscription status');
          }

          setHasActiveSubscription(data.hasActiveSubscription);
          
          if (!data.hasActiveSubscription) {
            toast.error("An active subscription is required to access design requests");
            router.push("/dashboard/billing");
            return;
          }

          // If we have an active subscription, fetch the requests
          fetchRequests();
        } catch (error) {
          console.error('Error checking subscription:', error);
          toast.error("Failed to verify subscription status");
          router.push("/dashboard/billing");
        }
      }
    };

    checkSubscription();
  }, [status, session, router]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/design-requests");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Failed to fetch requests");
      }
      
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default" className="bg-green-500 text-white">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="default" className="bg-blue-500 text-white">In Progress</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Badge variant="destructive">High</Badge>;
      case "MEDIUM":
        return <Badge variant="default" className="bg-yellow-500 text-white">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-lg font-medium">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please check your connection and try again
          </p>
          <Button onClick={() => fetchRequests()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Subscription Required</h2>
          <p className="text-muted-foreground">
            An active subscription is required to access design requests.
          </p>
          <Button onClick={() => router.push("/dashboard/billing")}>
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Subscription
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Design Requests</h1>
        <Button onClick={() => router.push("/dashboard/requests/new")}>
          Create New Request
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={setPriorityFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No design requests found. Create your first request to get started!
          </div>
        ) : (
          filteredRequests.map((request) => (
            <Link
              key={request.id}
              href={`/dashboard/requests/${request.id}`}
              className="block"
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {request.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.projectType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.fileFormat}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.dimensions}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.messages?.length ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.assignedTo?.name || "Unassigned"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
} 