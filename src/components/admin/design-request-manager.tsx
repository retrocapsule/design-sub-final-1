'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Check, Clock, AlertTriangle, Users, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

// Define interfaces for data structures (adjust based on your actual Prisma schema)
interface DesignRequestUser {
    name: string | null;
    email: string | null;
}

interface DesignRequest {
    id: string;
    title: string;
    description: string;
    status: string; // e.g., PENDING, IN_PROGRESS, COMPLETED, REVISION_REQUESTED
    priority: string; // e.g., LOW, MEDIUM, HIGH
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    user: DesignRequestUser; // Nested user object
    assignedToId?: string | null; 
    // assignedTo?: DesignRequestUser | null; // If you fetch assigned admin details
    // Add other fields as needed: projectType, fileFormat, dimensions, files etc.
}

// Define possible statuses for filtering and updating
const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED", "REVISION_REQUESTED", "CANCELLED"]; // Example statuses

export function DesignRequestManager() {
    const router = useRouter();
    const [requests, setRequests] = useState<DesignRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    // Fetch design requests based on filter
    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            setError(null);
            try {
                let apiUrl = '/api/admin/design-requests';
                if (filterStatus !== 'ALL') {
                    apiUrl += `?status=${filterStatus}`;
                }
                console.log(`Fetching from: ${apiUrl}`); // Log the URL being fetched

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                 // Parse date strings into Date objects
                 const parsedData: DesignRequest[] = data.map((req: any) => ({
                    ...req,
                    createdAt: new Date(req.createdAt),
                    updatedAt: new Date(req.updatedAt),
                }));
                setRequests(parsedData);
            } catch (err) {
                console.error("Failed to fetch design requests:", err);
                const message = err instanceof Error ? err.message : "Failed to load requests";
                setError(message);
                setRequests([]); // Clear requests on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [filterStatus]); // Re-fetch when filterStatus changes

    // Function to navigate to the detail page
    const navigateToDetail = (requestId: string) => {
        router.push(`/admin/requests/${requestId}`);
    };

    // Function to handle status update
    const handleStatusUpdate = async (requestId: string, newStatus: string) => {
        console.log(`Updating request ${requestId} to status ${newStatus}`);
        // Find the request to update its UI optimistically (optional)
        const originalRequests = [...requests];
        setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));

        try {
            const response = await fetch(`/api/admin/design-requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update status');
            }
            
            const updatedRequest = await response.json();
             // Update the state with the final confirmed data from the server
             setRequests(prev => prev.map(req => req.id === requestId ? { ...updatedRequest, createdAt: new Date(updatedRequest.createdAt), updatedAt: new Date(updatedRequest.updatedAt) } : req));

            toast.success(`Request status updated to ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status:", err);
            const message = err instanceof Error ? err.message : "Update failed";
            toast.error(message);
            // Revert optimistic update on error
            setRequests(originalRequests);
        }
    };

    // Helper to format dates
    const formatDate = (date: Date | undefined) => {
        if (!date) return 'N/A';
        // Use a shorter date format
        return format(date, 'MMM d, yyyy'); // e.g., Sep 21, 2023 
    }

     // Helper to get badge color based on status
     const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status.toUpperCase()) {
            case "PENDING": return "secondary";
            case "IN_PROGRESS": return "default"; // Blue/Primary
            case "COMPLETED": return "default"; // Use default and add custom success styling if needed
            case "REVISION_REQUESTED": return "outline";
            case "CANCELLED": return "destructive";
            default: return "secondary";
        }
    }
     // Helper to get badge color based on priority
     const getPriorityBadgeVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (priority?.toUpperCase()) {
            case "LOW": return "secondary";
            case "MEDIUM": return "default"; // Blue/Primary
            case "HIGH": return "destructive";
            default: return "secondary";
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Manage Design Requests</CardTitle>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Filter by Status:</span>
                     <Select 
                        value={filterStatus}
                        onValueChange={(value) => setFilterStatus(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            {STATUS_OPTIONS.map(status => (
                                <SelectItem key={status} value={status}>{status.replace("_", " ")}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                     <div className="text-center text-red-600 py-4">
                         Error loading requests: {error}
                     </div>
                )}
                {/* Add wrapper for horizontal scrolling */}
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Loading requests...
                                    </TableCell>
                                </TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No design requests found{filterStatus !== 'ALL' ? ` with status ${filterStatus.replace("_", " ")}` : ''}.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => (
                                    <TableRow 
                                        key={request.id}
                                        onClick={() => navigateToDetail(request.id)} 
                                        className="cursor-pointer hover:bg-muted/50"
                                    >
                                        <TableCell className="font-medium max-w-[200px] truncate">{request.title}</TableCell>
                                        <TableCell>{request.user?.name || request.user?.email || 'Unknown User'}</TableCell>
                                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={getPriorityBadgeVariant(request.priority)} 
                                                className="whitespace-nowrap" // Prevent wrapping
                                            >
                                                {request.priority || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={getStatusBadgeVariant(request.status)} 
                                                // Add success color explicitly for COMPLETED, keep nowrap
                                                className={cn(
                                                    "whitespace-nowrap", 
                                                    request.status === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                                                )}
                                            >
                                                {request.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}> {/* Prevent row click when clicking actions cell */} 
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigateToDetail(request.id)}>
                                                        View/Manage Request
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                    {STATUS_OPTIONS.map(status => (
                                                        request.status !== status && (
                                                            <DropdownMenuItem key={status} onClick={() => handleStatusUpdate(request.id, status)}>
                                                                Mark as {status.replace("_", " ")}
                                                            </DropdownMenuItem>
                                                        )
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                 {/* TODO: Add Pagination Controls if needed */}
            </CardContent>
        </Card>
    );
} 