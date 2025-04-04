import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { RequestMessages } from '@/components/admin/request-messages';
import { AdminRequestControls } from '@/components/admin/AdminRequestControls';

// Helper to get badge color based on status (copied from manager for consistency)
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toUpperCase()) {
        case "PENDING": return "secondary";
        case "IN_PROGRESS": return "default";
        case "COMPLETED": return "default";
        case "REVISION_REQUESTED": return "outline";
        case "CANCELLED": return "destructive";
        default: return "secondary";
    }
}
 // Helper to get badge color based on priority (copied from manager for consistency)
 const getPriorityBadgeVariant = (priority: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority?.toUpperCase()) {
        case "LOW": return "secondary";
        case "MEDIUM": return "default";
        case "HIGH": return "destructive";
        default: return "secondary";
    }
}

// Helper to format dates
const formatDate = (date: Date | undefined | null) => {
    if (!date) return 'N/A';
    return format(date, 'MMM d, yyyy h:mm a'); // More detailed format for this page
}

// Fetch function for a single design request
async function getDesignRequest(id: string) {
    // Add admin check here too, maybe redundant if page access is checked but good practice
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
        // Although the page checks access, API should ideally be protected too
        return null; // Or throw an error
    }

    const request = await prisma.designRequest.findUnique({
        where: { id },
        include: {
            user: { // Include user details
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            messages: {
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    isRead: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                            role: true, // Include role here if needed for message display
                        }
                    }
                }
            },
            assignedTo: { // Include assigned admin details
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    if (!request) {
        notFound(); // Trigger Next.js 404 page if request doesn't exist
    }
    return request;
}

// Fetch function for admin users
async function getAdminUsers() {
    const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: {
            id: true,
            name: true,
            email: true,
        },
        orderBy: {
            name: 'asc' // Optional: order admins by name
        }
    });
    return admins;
}

// The Page component
export default async function DesignRequestDetailPage({ params: { id } }: { params: { id: string } }) {
    // Admin Check for Page Access
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/signin?callbackUrl=/admin"); // Redirect non-admins
    }

    // Fetch request and admins in parallel
    const [request, adminUsers] = await Promise.all([
        getDesignRequest(id),
        getAdminUsers()
    ]);

    // Should not happen if getDesignRequest handles notFound(), but satisfies TypeScript
    if (!request) { return null; }

    // Map messages to include isFromAdmin and format createdAt
    const formattedMessages = request.messages.map(message => ({
        ...message,
        isFromAdmin: message.user?.role === "ADMIN",
        createdAt: message.createdAt.toISOString(), // Format date to ISO string
    }));

    const assignedAdminName = request.assignedTo?.name || request.assignedTo?.email;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button and Title */}
            <div className="mb-6 flex items-center justify-between">
                 <Button variant="outline" asChild>
                     <Link href="/admin/requests" > {/* Link back to the requests list page */}
                       <ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests List
                     </Link>
                 </Button>
                <h1 className="text-2xl font-bold truncate ml-4 flex-1">Request: {request.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area (Details, Messages, Files) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Request Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                                <strong className="text-muted-foreground">Submitted By:</strong>
                                <span className="col-span-2">{request.user.name || request.user.email || 'Unknown'}</span>

                                <strong className="text-muted-foreground">Submitted On:</strong>
                                <span className="col-span-2">{formatDate(request.createdAt)}</span>

                                <strong className="text-muted-foreground">Last Updated:</strong>
                                <span className="col-span-2">{formatDate(request.updatedAt)}</span>
                                
                                <strong className="text-muted-foreground">Project Type:</strong>
                                <span className="col-span-2">{request.projectType || 'N/A'}</span>

                                <strong className="text-muted-foreground">Format:</strong>
                                <span className="col-span-2">{request.fileFormat || 'N/A'}</span>

                                 <strong className="text-muted-foreground">Dimensions:</strong>
                                 <span className="col-span-2">{request.dimensions || 'N/A'}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <strong className="text-muted-foreground block mb-2">Description:</strong>
                                <p className="whitespace-pre-wrap">{request.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Messages Component */}
                    <RequestMessages
                        initialMessages={formattedMessages}
                        designRequestId={request.id}
                        requestUser={request.user}
                        currentUser={session.user}
                    />

                    {/* TODO: Placeholder for File Management */}
                     <Card>
                        <CardHeader>
                            <CardTitle>Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-center py-4">File management component coming soon...</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Area (Status, Priority, Assignee, Actions) */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status & Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-1">Current Status</label>
                                 <Badge 
                                     variant={getStatusBadgeVariant(request.status)} 
                                     className={cn(request.status === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700 text-white' : '')}
                                >
                                     {request.status.replace("_", " ")}
                                </Badge>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-1">Priority</label>
                                <Badge variant={getPriorityBadgeVariant(request.priority)}>
                                     {request.priority || 'None'} { /* Display None if null */}
                                </Badge>
                            </div>
                            <div>
                                 <label className="text-sm font-medium text-muted-foreground block mb-1">Assigned To</label>
                                 <p className="text-sm">{assignedAdminName || 'Unassigned'}</p> { /* Use the fetched admin name */ }
                            </div>
                           {/* Admin Controls Section */}
                           <div className="pt-4 border-t">
                                <h4 className="text-sm font-semibold mb-2">Admin Controls</h4>
                                {/* Render the AdminRequestControls component */}
                                <AdminRequestControls request={request} adminUsers={adminUsers} />
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 