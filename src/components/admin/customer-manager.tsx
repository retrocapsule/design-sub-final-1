'use client';

import { useState, useEffect } from 'react';
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
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, UserPlus, Mail, Calendar, CreditCard, Eye, RefreshCw, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

// Define interfaces for data structures
interface Subscription {
    id: string;
    status: string;
    packageId: string;
    package: {
        name: string;
    };
    createdAt: Date;
}

interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    onboardingCompleted: boolean;
    stripeCustomerId: string | null;
    subscription: Subscription | null;
}

export function CustomerManager() {
    const router = useRouter();
    const [customers, setCustomers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Fetch customers based on filter
    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                let apiUrl = '/api/admin/customers';
                const params = new URLSearchParams();
                
                if (filterStatus !== 'ALL') {
                    params.append('status', filterStatus);
                }
                
                if (searchQuery.trim()) {
                    params.append('search', searchQuery.trim());
                }
                
                if (params.toString()) {
                    apiUrl += `?${params.toString()}`;
                }

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Parse date strings into Date objects
                const parsedData: User[] = data.map((user: any) => ({
                    ...user,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt),
                    subscription: user.subscription ? {
                        ...user.subscription,
                        createdAt: new Date(user.subscription.createdAt)
                    } : null
                }));
                setCustomers(parsedData);
            } catch (err) {
                console.error("Failed to fetch customers:", err);
                const message = err instanceof Error ? err.message : "Failed to load customers";
                setError(message);
                setCustomers([]); // Clear customers on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomers();
    }, [filterStatus, searchQuery]); // Re-fetch when filters change

    // Function to handle subscription status update
    const handleStatusUpdate = async (userId: string, newStatus: string) => {
        console.log(`Updating user ${userId} subscription to status ${newStatus}`);
        const originalCustomers = [...customers];
        
        // Optimistic update
        setCustomers(prev => prev.map(customer => {
            if (customer.id === userId && customer.subscription) {
                return {
                    ...customer,
                    subscription: {
                        ...customer.subscription,
                        status: newStatus
                    }
                };
            }
            return customer;
        }));

        try {
            const response = await fetch(`/api/admin/customers/${userId}/subscription`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update subscription status');
            }
            
            toast.success(`Subscription status updated to ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status:", err);
            const message = err instanceof Error ? err.message : "Update failed";
            toast.error(message);
            // Revert optimistic update on error
            setCustomers(originalCustomers);
        }
    };

    // Helper to format dates
    const formatDate = (date: Date | undefined) => {
        if (!date) return 'N/A';
        return format(date, 'MMM d, yyyy');
    }

    // Helper to get subscription status badge
    const getSubscriptionBadgeVariant = (status: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return "outline";
        
        switch (status.toUpperCase()) {
            case "ACTIVE":
                return "default";
            case "TRIALING":
                return "secondary";
            case "PAST_DUE":
                return "destructive";
            case "CANCELED":
                return "outline";
            default:
                return "outline";
        }
    }

    // Handle navigation to customer detail
    const navigateToCustomerDetail = (customerId: string) => {
        router.push(`/admin/customers/${customerId}`);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Manage Customers</CardTitle>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Input
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[220px]"
                        />
                    </div>
                    <Select 
                        value={filterStatus}
                        onValueChange={(value) => setFilterStatus(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Subscription Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="TRIALING">Trial</SelectItem>
                            <SelectItem value="PAST_DUE">Past Due</SelectItem>
                            <SelectItem value="CANCELED">Canceled</SelectItem>
                            <SelectItem value="NONE">No Subscription</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                     <div className="text-center text-red-600 py-4">
                         Error loading customers: {error}
                     </div>
                )}
                {/* Add wrapper for horizontal scrolling */}
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined Date</TableHead>
                                <TableHead>Subscription</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Loading customers...
                                    </TableCell>
                                </TableRow>
                            ) : customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.map((customer) => (
                                    <TableRow 
                                        key={customer.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigateToCustomerDetail(customer.id)}
                                    >
                                        <TableCell className="font-medium">
                                            {customer.name || 'Unnamed User'}
                                        </TableCell>
                                        <TableCell>{customer.email || 'No Email'}</TableCell>
                                        <TableCell>{formatDate(customer.createdAt)}</TableCell>
                                        <TableCell>
                                            {customer.subscription ? customer.subscription.package.name : 'No Subscription'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={getSubscriptionBadgeVariant(customer.subscription?.status)} 
                                                className="whitespace-nowrap"
                                            >
                                                {customer.subscription?.status || 'No Subscription'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => navigateToCustomerDetail(customer.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        <span>View Details</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Mail className="mr-2 h-4 w-4" />
                                                        <span>Send Email</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {customer.subscription ? (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusUpdate(customer.id, 'ACTIVE');
                                                                }}
                                                                disabled={customer.subscription?.status === 'ACTIVE'}
                                                            >
                                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                                <span>Activate Subscription</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusUpdate(customer.id, 'CANCELED');
                                                                }}
                                                                disabled={customer.subscription?.status === 'CANCELED'}
                                                            >
                                                                <UserX className="mr-2 h-4 w-4" />
                                                                <span>Cancel Subscription</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) : (
                                                        <DropdownMenuItem>
                                                            <UserPlus className="mr-2 h-4 w-4" />
                                                            <span>Create Subscription</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
} 