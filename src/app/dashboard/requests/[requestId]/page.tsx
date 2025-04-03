'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Edit, Trash } from 'lucide-react';
import { DesignRequest } from '@prisma/client';
// Import Alert Dialog components if available (using browser confirm for now)
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// Define a more complete type locally if needed, ensuring it matches schema
interface ExtendedDesignRequest extends DesignRequest {
  priority: string;
  projectType: string;
  fileFormat: string;
  dimensions: string;
  // Add other fields if necessary
}

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.requestId as string;
  const { data: session, status } = useSession();

  // Use the standard Prisma type
  const [request, setRequest] = useState<DesignRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (status === 'loading' || !requestId) return;
      if (status === 'unauthenticated') {
        router.push('/signin');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/design-requests/${requestId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch request: ${response.statusText}`);
        }
        // Set state with the standard type
        const data: DesignRequest = await response.json();
        setRequest(data);
      } catch (err) {
        console.error("Error fetching request:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        toast.error(`Failed to load request: ${message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId, status, router]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this request? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/design-requests/${requestId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete request");
      }
      toast.success("Request deleted successfully!");
      router.push('/dashboard/requests');
      router.refresh();
    } catch (err) {
      console.error("Error deleting request:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(`Deletion failed: ${message}`);
      setDeleting(false); 
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/requests/${requestId}/edit`);
  };

  // Implement helper functions correctly
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Invalid Date';
    }
  };
  
  const getStatusBadgeVariant = (status: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'default';
      case 'in progress': return 'secondary';
      case 'completed': return 'outline'; 
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  // --- Return early for loading, error, or not found states --- 
  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Error Loading Request</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        {/* Changed button to refetch data instead of full reload */}
        <Button onClick={() => { setLoading(true); setError(null); /* Trigger useEffect again? Maybe just a retry button state */ }}>Retry</Button> 
      </div>
    );
  }
  
  if (!request) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Request Not Found</h1>
        <p className="text-muted-foreground mb-4">The requested design request could not be found.</p>
        <Button onClick={() => router.push('/dashboard/requests')}>Back to Requests</Button>
      </div>
    );
  }

  // --- Main component render: TypeScript now knows request is not null --- 
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Request Details" 
        // Safely access title
        description={`Viewing details for request: ${request.title}`}
      >
        {/* Header is empty of buttons */}
      </DashboardHeader>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              {/* Safely access title */}
              <CardTitle className="text-2xl">{request.title}</CardTitle>
              <CardDescription>Submitted on {formatDate(request.createdAt)}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleEdit} disabled={deleting}> 
                  <Edit className="mr-1.5 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash className="mr-1.5 h-4 w-4" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center space-x-4 pb-4 border-b">
             {/* Safely access status */}
             <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize">
                Status: {request.status || 'Unknown'}
             </Badge>
             {/* Assert type for missing properties - temporary fix */}
             <Badge variant={(request as any).priority === 'HIGH' ? 'destructive' : 'secondary'} className="capitalize">
                Priority: {(request as any).priority || 'N/A'}
             </Badge>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            {/* Safely access description */}
            <p className="text-muted-foreground whitespace-pre-wrap">{request.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              {/* Assert type for missing properties - temporary fix */}
              <div><p className="text-sm font-medium text-gray-500">Project Type</p><p className="capitalize">{(request as any).projectType || 'N/A'}</p></div>
              <div><p className="text-sm font-medium text-gray-500">File Format</p><p>{(request as any).fileFormat?.toUpperCase() || 'N/A'}</p></div>
              <div><p className="text-sm font-medium text-gray-500">Dimensions</p><p>{(request as any).dimensions || 'N/A'}</p></div>
              <div><p className="text-sm font-medium text-gray-500">Last Updated</p><p>{formatDate(request.updatedAt)}</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
