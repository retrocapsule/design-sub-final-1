'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
    Calendar, 
    CreditCard, 
    Loader2, 
    Mail, 
    Package, 
    RefreshCw, 
    Shield, 
    ShoppingBag, 
    Trash2, 
    UserCog 
} from 'lucide-react';

// Types for our data models
interface Package {
    id: string;
    name: string;
    originalPrice: number;
    price: number;
    features: string[];
    isActive: boolean;
}

interface Subscription {
    id: string;
    status: string;
    packageId: string;
    package: Package;
    createdAt: Date;
    updatedAt: Date;
    stripePriceId?: string | null;
    stripeSubscriptionId?: string | null;
}

interface DesignRequest {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
}

interface Account {
    id: string;
    provider: string;
    providerAccountId: string;
}

interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
    onboardingCompleted: boolean;
    stripeCustomerId: string | null;
    subscription: Subscription | null;
    designRequests: DesignRequest[];
    accounts: Account[];
}

interface CustomerDetailProps {
    userId: string;
}

export function CustomerDetail({ userId }: CustomerDetailProps) {
    const router = useRouter();
    const [customer, setCustomer] = useState<User | null>(null);
    const [packages, setPackages] = useState<Package[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'USER',
        onboardingCompleted: false
    });
    
    // Subscription form state
    const [subscriptionData, setSubscriptionData] = useState({
        packageId: '',
        status: 'ACTIVE'
    });

    // Fetch customer data
    useEffect(() => {
        const fetchCustomerDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/admin/customers/${userId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                
                const { user, packages: pkgs } = await response.json();
                
                // Parse dates
                const parsedUser = {
                    ...user,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt),
                    subscription: user.subscription ? {
                        ...user.subscription,
                        createdAt: new Date(user.subscription.createdAt),
                        updatedAt: new Date(user.subscription.updatedAt)
                    } : null,
                    designRequests: user.designRequests.map((req: any) => ({
                        ...req,
                        createdAt: new Date(req.createdAt)
                    }))
                };
                
                setCustomer(parsedUser);
                setPackages(pkgs);
                
                // Initialize form data
                setFormData({
                    name: parsedUser.name || '',
                    email: parsedUser.email || '',
                    role: parsedUser.role,
                    onboardingCompleted: parsedUser.onboardingCompleted
                });
                
                // Initialize subscription data if exists
                if (parsedUser.subscription) {
                    setSubscriptionData({
                        packageId: parsedUser.subscription.packageId,
                        status: parsedUser.subscription.status
                    });
                }
            } catch (err) {
                console.error("Failed to fetch customer details:", err);
                const message = err instanceof Error ? err.message : "Failed to load customer details";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchCustomerDetails();
        }
    }, [userId]);

    // Helper function to format dates
    const formatDate = (date: Date | undefined) => {
        if (!date) return 'N/A';
        return format(date, 'PPP'); // Localized date format
    };

    // Handle form input changes
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle subscription form changes
    const handleSubscriptionChange = (field: string, value: any) => {
        setSubscriptionData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Save user profile changes
    const handleSaveProfile = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/admin/customers/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const updatedUser = await response.json();
            setCustomer(prev => ({
                ...prev!,
                ...updatedUser,
            }));
            toast.success('Customer profile updated successfully');
        } catch (err) {
            console.error('Error updating profile:', err);
            const message = err instanceof Error ? err.message : 'Failed to update profile';
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Create a new subscription
    const handleCreateSubscription = async () => {
        if (!subscriptionData.packageId) {
            toast.error('Please select a package');
            return;
        }

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/admin/customers/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptionUpdate: {
                        action: 'create',
                        packageId: subscriptionData.packageId,
                        status: subscriptionData.status,
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create subscription');
            }

            const updatedUser = await response.json();
            
            // Parse dates in the updated user
            const parsedUser = {
                ...updatedUser,
                createdAt: new Date(updatedUser.createdAt),
                updatedAt: new Date(updatedUser.updatedAt),
                subscription: updatedUser.subscription ? {
                    ...updatedUser.subscription,
                    createdAt: new Date(updatedUser.subscription.createdAt),
                    updatedAt: new Date(updatedUser.subscription.updatedAt)
                } : null
            };

            setCustomer(parsedUser);
            toast.success('Subscription created successfully');
        } catch (err) {
            console.error('Error creating subscription:', err);
            const message = err instanceof Error ? err.message : 'Failed to create subscription';
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Update an existing subscription
    const handleUpdateSubscription = async () => {
        if (!customer?.subscription) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/admin/customers/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptionUpdate: {
                        action: 'update',
                        packageId: subscriptionData.packageId,
                        status: subscriptionData.status,
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update subscription');
            }

            const updatedUser = await response.json();
            
            // Parse dates in the updated user
            const parsedUser = {
                ...updatedUser,
                createdAt: new Date(updatedUser.createdAt),
                updatedAt: new Date(updatedUser.updatedAt),
                subscription: updatedUser.subscription ? {
                    ...updatedUser.subscription,
                    createdAt: new Date(updatedUser.subscription.createdAt),
                    updatedAt: new Date(updatedUser.subscription.updatedAt)
                } : null
            };

            setCustomer(parsedUser);
            toast.success('Subscription updated successfully');
        } catch (err) {
            console.error('Error updating subscription:', err);
            const message = err instanceof Error ? err.message : 'Failed to update subscription';
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Delete subscription
    const handleDeleteSubscription = async () => {
        if (!customer?.subscription) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/admin/customers/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptionUpdate: {
                        action: 'delete',
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete subscription');
            }

            const updatedUser = await response.json();
            
            // Parse dates in the updated user
            const parsedUser = {
                ...updatedUser,
                createdAt: new Date(updatedUser.createdAt),
                updatedAt: new Date(updatedUser.updatedAt),
                subscription: null
            };

            setCustomer(parsedUser);
            setSubscriptionData({
                packageId: '',
                status: 'ACTIVE'
            });
            toast.success('Subscription deleted successfully');
        } catch (err) {
            console.error('Error deleting subscription:', err);
            const message = err instanceof Error ? err.message : 'Failed to delete subscription';
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading customer details...</span>
                </div>
            ) : error ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-red-600 py-4">
                            Error: {error}
                            <Button 
                                variant="outline" 
                                className="ml-4" 
                                onClick={() => router.push('/admin/customers')}
                            >
                                Back to Customers
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : customer ? (
                <>
                    {/* Customer Header Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{customer.name || 'Unnamed Customer'}</CardTitle>
                                <CardDescription className="flex items-center mt-1">
                                    <Mail className="mr-1 h-4 w-4" />
                                    {customer.email || 'No email provided'}
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/admin/customers')}
                            >
                                Back to Customers
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Customer Since</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(customer.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Account Type</p>
                                        <Badge variant={customer.role === 'ADMIN' ? 'destructive' : 'outline'}>
                                            {customer.role}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Subscription</p>
                                        {customer.subscription ? (
                                            <Badge variant="default">
                                                {customer.subscription.package.name} - {customer.subscription.status}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">No Subscription</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs for different sections */}
                    <Tabs defaultValue="profile">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="subscription">Subscription</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>
                                        Update the customer's profile information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input 
                                            id="name" 
                                            value={formData.name} 
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            value={formData.email} 
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Account Type</Label>
                                        <Select 
                                            value={formData.role} 
                                            onValueChange={(value) => handleInputChange('role', value)}
                                        >
                                            <SelectTrigger id="role">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USER">User</SelectItem>
                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox 
                                            id="onboarding" 
                                            checked={formData.onboardingCompleted}
                                            onCheckedChange={(checked) => handleInputChange('onboardingCompleted', checked)}
                                        />
                                        <Label htmlFor="onboarding">Onboarding completed</Label>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        onClick={handleSaveProfile}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Subscription Tab */}
                        <TabsContent value="subscription">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Subscription Management</CardTitle>
                                    <CardDescription>
                                        {customer.subscription 
                                            ? 'Update or cancel the customer\'s subscription' 
                                            : 'Create a new subscription for this customer'
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {customer.subscription ? (
                                        <div className="space-y-4">
                                            <div className="p-4 border rounded-md bg-slate-50">
                                                <h3 className="font-medium mb-2">Current Subscription</h3>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>Package:</div>
                                                    <div className="font-medium">{customer.subscription.package.name}</div>
                                                    <div>Status:</div>
                                                    <div className="font-medium">{customer.subscription.status}</div>
                                                    <div>Price:</div>
                                                    <div className="font-medium">${customer.subscription.package.price / 100}/mo</div>
                                                    <div>Started:</div>
                                                    <div className="font-medium">{formatDate(customer.subscription.createdAt)}</div>
                                                    {customer.subscription.stripeSubscriptionId && (
                                                        <>
                                                            <div>Stripe ID:</div>
                                                            <div className="font-medium truncate">{customer.subscription.stripeSubscriptionId}</div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4 pt-4 border-t">
                                                <h3 className="font-medium">Update Subscription</h3>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="package">Package</Label>
                                                    <Select 
                                                        value={subscriptionData.packageId} 
                                                        onValueChange={(value) => handleSubscriptionChange('packageId', value)}
                                                    >
                                                        <SelectTrigger id="package">
                                                            <SelectValue placeholder="Select a package" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {packages.map((pkg) => (
                                                                <SelectItem key={pkg.id} value={pkg.id}>
                                                                    {pkg.name} (${pkg.price / 100}/mo)
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Status</Label>
                                                    <Select 
                                                        value={subscriptionData.status} 
                                                        onValueChange={(value) => handleSubscriptionChange('status', value)}
                                                    >
                                                        <SelectTrigger id="status">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                                            <SelectItem value="TRIALING">Trial</SelectItem>
                                                            <SelectItem value="PAST_DUE">Past Due</SelectItem>
                                                            <SelectItem value="CANCELED">Canceled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div className="flex justify-between pt-4">
                                                    <Button
                                                        onClick={handleUpdateSubscription}
                                                        disabled={isUpdating}
                                                        className="flex-1 mr-2"
                                                    >
                                                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Update Subscription
                                                    </Button>
                                                    
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" className="flex-1">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Cancel Subscription
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the customer's subscription.
                                                                    This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={handleDeleteSubscription}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    {isUpdating ? (
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                    )}
                                                                    Delete Subscription
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-4 border rounded-md bg-slate-50">
                                                <h3 className="font-medium mb-2">No Active Subscription</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    This customer doesn't have an active subscription.
                                                    Create one using the form below.
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-4 pt-4">
                                                <h3 className="font-medium">Create New Subscription</h3>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="newPackage">Package</Label>
                                                    <Select 
                                                        value={subscriptionData.packageId} 
                                                        onValueChange={(value) => handleSubscriptionChange('packageId', value)}
                                                    >
                                                        <SelectTrigger id="newPackage">
                                                            <SelectValue placeholder="Select a package" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {packages.map((pkg) => (
                                                                <SelectItem key={pkg.id} value={pkg.id}>
                                                                    {pkg.name} (${pkg.price / 100}/mo)
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="newStatus">Status</Label>
                                                    <Select 
                                                        value={subscriptionData.status} 
                                                        onValueChange={(value) => handleSubscriptionChange('status', value)}
                                                    >
                                                        <SelectTrigger id="newStatus">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                                            <SelectItem value="TRIALING">Trial</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <Button
                                                    onClick={handleCreateSubscription}
                                                    disabled={isUpdating || !subscriptionData.packageId}
                                                    className="w-full mt-2"
                                                >
                                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Create Subscription
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Activity Tab */}
                        <TabsContent value="activity">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>
                                        View the customer's recent design requests and activity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Recent Design Requests</h3>
                                        {customer.designRequests && customer.designRequests.length > 0 ? (
                                            <div className="space-y-2">
                                                {customer.designRequests.map((request) => (
                                                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-md">
                                                        <div>
                                                            <p className="font-medium">{request.title}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Created: {formatDate(request.createdAt)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Badge variant="outline">{request.status}</Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="ml-2"
                                                                onClick={() => router.push(`/admin/requests/${request.id}`)}
                                                            >
                                                                View
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No design requests found for this customer.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-4 mt-6">
                                        <h3 className="font-medium">Authentication Methods</h3>
                                        {customer.accounts && customer.accounts.length > 0 ? (
                                            <div className="space-y-2">
                                                {customer.accounts.map((account) => (
                                                    <div key={account.id} className="flex items-center p-3 border rounded-md">
                                                        <div>
                                                            <p className="font-medium capitalize">{account.provider}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                ID: {account.providerAccountId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center p-3 border rounded-md">
                                                <div>
                                                    <p className="font-medium">Email/Password</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Using email and password authentication
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-4">
                            Customer not found.
                            <Button 
                                variant="outline" 
                                className="ml-4" 
                                onClick={() => router.push('/admin/customers')}
                            >
                                Back to Customers
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 