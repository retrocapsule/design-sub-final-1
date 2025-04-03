'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { DesignRequest, DesignRequestStatus, DesignPriority, User } from '@prisma/client';
import {
    updateDesignRequestStatus,
    updateDesignRequestPriority,
    updateDesignRequestAssignment
} from '@/actions/adminActions';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';

interface AdminRequestControlsProps {
    request: DesignRequest;
    adminUsers: Pick<User, 'id' | 'name' | 'email'>[]; // Only need id and name/email
}

// Helper Submit Button component to show loading state
function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} size="sm" className="w-full mt-2">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {label}
        </Button>
    );
}

// Define fallback status and priority options in case enums are undefined
const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REVISION_REQUESTED', 'CANCELLED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

export function AdminRequestControls({ request, adminUsers }: AdminRequestControlsProps) {
    const [status, setStatus] = useState<string>(request.status);
    const [priority, setPriority] = useState<string | null>(request.priority);
    const [assignedToId, setAssignedToId] = useState<string | null>(request.assignedToId);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle status update with direct form submission
    const handleStatusSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission
        setIsSubmitting(true);
        
        try {
            // Create a FormData object from the form
            const form = event.currentTarget;
            const formData = new FormData(form);
            
            // Log what we're submitting for debugging
            const requestId = formData.get('requestId');
            const statusValue = formData.get('status');
            console.log("Submitting status update:", {
                requestId,
                status: statusValue
            });
            
            // Validate we have values before submitting
            if (!requestId || !statusValue) {
                console.error("Missing required fields for status update");
                toast.error('Missing required fields for status update');
                return;
            }
            
            const result = await updateDesignRequestStatus(formData);
            console.log("Result from server:", result);
            
            // Improved error handling based on server response structure
            if (result) {
                // Check if there are any actual errors (not just an empty errors object)
                const hasErrors = result.errors && 
                                 typeof result.errors === 'object' && 
                                 Object.keys(result.errors).length > 0;
                
                if (!hasErrors) {
                    // Success case - either no errors object or empty errors object
                    toast.success(result.message || 'Status updated successfully');
                    // Update local state with the new status
                    setStatus(statusValue.toString());
                } else {
                    // Real errors exist in the errors object
                    toast.error(result.message || 'Failed to update status');
                    console.error("Status Update Errors:", result.errors);
                    
                    // Display specific error messages if available
                    if (result.errors.database) {
                        toast.error(`Database error: ${result.errors.database[0]}`);
                    }
                    if (result.errors.status) {
                        toast.error(`Status error: ${result.errors.status[0]}`);
                    }
                    if (result.errors.server) {
                        toast.error(`Server error: ${result.errors.server[0]}`);
                    }
                }
            } else {
                toast.error('Failed to update status: No response from server');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle priority update with direct form submission
    const handlePrioritySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission
        setIsSubmitting(true);
        
        try {
            // Create a FormData object from the form
            const form = event.currentTarget;
            const formData = new FormData(form);
            
            // Log what we're submitting for debugging
            const requestId = formData.get('requestId');
            const priorityValue = formData.get('priority');
            console.log("Submitting priority update:", {
                requestId,
                priority: priorityValue
            });
            
            // Validate we have requestId before submitting
            if (!requestId) {
                console.error("Missing required field: requestId");
                toast.error('Missing request ID for priority update');
                return;
            }
            
            const result = await updateDesignRequestPriority(formData);
            console.log("Result from server:", result);
            
            // Improved error handling based on server response structure
            if (result) {
                // Check if there are any actual errors (not just an empty errors object)
                const hasErrors = result.errors && 
                                 typeof result.errors === 'object' && 
                                 Object.keys(result.errors).length > 0;
                
                if (!hasErrors) {
                    // Success case - either no errors object or empty errors object
                    toast.success(result.message || 'Priority updated successfully');
                    // Update local state with the new priority
                    const newPriorityValue = priorityValue?.toString();
                    setPriority(newPriorityValue === 'null' ? null : newPriorityValue);
                } else {
                    // Real errors exist in the errors object
                    toast.error(result.message || 'Failed to update priority');
                    console.error("Priority Update Errors:", result.errors);
                    
                    // Display specific error messages if available
                    if (result.errors.database) {
                        toast.error(`Database error: ${result.errors.database[0]}`);
                    }
                    if (result.errors.priority) {
                        toast.error(`Priority error: ${result.errors.priority[0]}`);
                    }
                    if (result.errors.server) {
                        toast.error(`Server error: ${result.errors.server[0]}`);
                    }
                }
            } else {
                toast.error('Failed to update priority: No response from server');
            }
        } catch (error) {
            console.error('Error updating priority:', error);
            toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle assignment update with direct form submission
    const handleAssignmentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission
        setIsSubmitting(true);
        
        try {
            // Create a FormData object from the form
            const form = event.currentTarget;
            const formData = new FormData(form);
            
            // Log what we're submitting for debugging
            const requestId = formData.get('requestId');
            const assignedToIdValue = formData.get('assignedToId');
            console.log("Submitting assignment update:", {
                requestId,
                assignedToId: assignedToIdValue
            });
            
            // Validate we have requestId before submitting
            if (!requestId) {
                console.error("Missing required field: requestId");
                toast.error('Missing request ID for assignment update');
                return;
            }
            
            const result = await updateDesignRequestAssignment(formData);
            console.log("Result from server:", result);
            
            // Improved error handling based on server response structure
            if (result) {
                // Check if there are any actual errors (not just an empty errors object)
                const hasErrors = result.errors && 
                                 typeof result.errors === 'object' && 
                                 Object.keys(result.errors).length > 0;
                
                if (!hasErrors) {
                    // Success case - either no errors object or empty errors object
                    toast.success(result.message || 'Assignment updated successfully');
                    // Update local state with the new assignment
                    const newAssignedToIdValue = assignedToIdValue?.toString();
                    setAssignedToId(newAssignedToIdValue === 'null' ? null : newAssignedToIdValue);
                } else {
                    // Real errors exist in the errors object
                    toast.error(result.message || 'Failed to update assignment');
                    console.error("Assignment Update Errors:", result.errors);
                    
                    // Display specific error messages if available
                    if (result.errors.database) {
                        toast.error(`Database error: ${result.errors.database[0]}`);
                    }
                    if (result.errors.assignedToId) {
                        toast.error(`Assignment error: ${result.errors.assignedToId[0]}`);
                    }
                    if (result.errors.server) {
                        toast.error(`Server error: ${result.errors.server[0]}`);
                    }
                }
            } else {
                toast.error('Failed to update assignment: No response from server');
            }
        } catch (error) {
            console.error('Error updating assignment:', error);
            toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Status Update Form */}
            <form onSubmit={handleStatusSubmit} className="space-y-2">
                <input type="hidden" name="requestId" value={request.id} />
                <Label htmlFor="status">Update Status</Label>
                <Select 
                    name="status" 
                    value={status} 
                    onValueChange={value => setStatus(value)}
                >
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {(typeof DesignRequestStatus !== 'undefined' 
                            ? Object.values(DesignRequestStatus) 
                            : STATUS_OPTIONS
                        ).map((status) => (
                            <SelectItem key={status} value={status}>
                                {String(status).replace('_', ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full mt-2">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Status
                </Button>
            </form>

            {/* Priority Update Form */}
            <form onSubmit={handlePrioritySubmit} className="space-y-2">
                <input type="hidden" name="requestId" value={request.id} />
                <Label htmlFor="priority">Update Priority</Label>
                <Select 
                    name="priority" 
                    value={priority || 'null'} 
                    onValueChange={value => setPriority(value === 'null' ? null : value)}
                >
                    <SelectTrigger id="priority">
                        <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null">None</SelectItem> {/* Option for no priority */}
                        {(typeof DesignPriority !== 'undefined' 
                            ? Object.values(DesignPriority) 
                            : PRIORITY_OPTIONS
                        ).map((priority) => (
                            <SelectItem key={priority} value={priority}>
                                {String(priority)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full mt-2">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Priority
                </Button>
            </form>

            {/* Assignment Update Form */}
            <form onSubmit={handleAssignmentSubmit} className="space-y-2">
                <input type="hidden" name="requestId" value={request.id} />
                <Label htmlFor="assignedToId">Assign To</Label>
                <Select 
                    name="assignedToId" 
                    value={assignedToId || 'null'} 
                    onValueChange={value => setAssignedToId(value === 'null' ? null : value)}
                >
                    <SelectTrigger id="assignedToId">
                        <SelectValue placeholder="Select Admin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null">Unassigned</SelectItem>
                        {adminUsers.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                                {admin.name || admin.email} {/* Display name or email */}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full mt-2">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Assignment
                </Button>
            </form>
        </div>
    );
} 