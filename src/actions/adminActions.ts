"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { DesignPriority, DesignRequestStatus, Role } from "@prisma/client";
import { z } from "zod";

// Define fallback status and priority options in case enums are undefined
const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REVISION_REQUESTED', 'CANCELLED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

// Helper function to check admin role
async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== Role.ADMIN) {
        throw new Error("Unauthorized: User is not an admin.");
    }
    return session.user;
}

// --- Update Design Request Status ---
const UpdateStatusSchema = z.object({
    requestId: z.string().cuid(),
    status: z.string(), // Accept any string first to avoid errors with enums
});

export async function updateDesignRequestStatus(formData: FormData) {
    try {
        await verifyAdmin();

        // Log the incoming form data for debugging
        const requestId = formData.get("requestId");
        const status = formData.get("status");
        
        console.log("Updating status with:", { requestId, status });
        
        // Check if values exist before validation
        if (!requestId || !status) {
            console.error("Missing required fields:", { requestId, status });
            return { 
                errors: { requestId: !requestId ? ["Required"] : [], status: !status ? ["Required"] : [] },
                message: 'Missing required fields for status update.'
            };
        }

        // First check if the request exists
        try {
            const existingRequest = await prisma.designRequest.findUnique({
                where: { id: requestId.toString() },
                select: { id: true }
            });
            
            if (!existingRequest) {
                console.error(`Design request with ID ${requestId} not found`);
                return {
                    errors: { requestId: ["Design request not found"] },
                    message: 'Design request not found. It may have been deleted.'
                };
            }
        } catch (error) {
            console.error("Error checking if design request exists:", error);
            return {
                errors: { database: ["Error checking design request"] },
                message: 'Database error: Unable to verify design request exists.'
            };
        }

        // Basic validation of request ID and status
        const requestIdStr = requestId.toString();
        const statusStr = status.toString();
        
        // List all valid status values for debugging
        const validStatusValues = DesignRequestStatus ? Object.values(DesignRequestStatus) : STATUS_OPTIONS;
        console.log("Valid status values:", validStatusValues);
        
        // Check if status is a valid DesignRequestStatus enum value
        if (!validStatusValues.includes(statusStr as any)) {
            console.error(`Invalid status value: "${statusStr}". Valid values:`, validStatusValues);
            return {
                errors: { status: [`Status must be one of: ${validStatusValues.join(', ')}`] },
                message: 'Invalid status value provided.'
            };
        }

        // Direct database update with minimal processing
        try {
            await prisma.$transaction(async (tx) => {
                await tx.designRequest.update({
                    where: { id: requestIdStr },
                    data: { status: statusStr as DesignRequestStatus },
                });
            });
            
            console.log(`Successfully updated status for request ${requestIdStr} to ${statusStr}`);
            
            // Revalidate paths for data refresh
            revalidatePath(`/admin/requests/${requestIdStr}`);
            revalidatePath('/admin/requests');
            
            return { 
                message: "Status updated successfully.",
                // Include empty errors object for consistency
                errors: {}
            };
        } catch (updateError) {
            console.error("Specific database error during update:", updateError);
            return {
                errors: { database: ["Failed to update design request status in database"] },
                message: `Database Error: ${updateError.message || 'Failed to update status'}`
            };
        }
    } catch (error) {
        console.error("Unexpected error in updateDesignRequestStatus:", error);
        return { 
            message: "Unexpected error: Failed to update status.", 
            errors: { server: [(error as Error).message || "Unknown server error"] } 
        };
    }
}

// --- Update Design Request Priority ---
const UpdatePrioritySchema = z.object({
    requestId: z.string().cuid(),
    priority: z.string().nullable(), // Accept any string first, including null
});

export async function updateDesignRequestPriority(formData: FormData) {
    try {
        await verifyAdmin();

        // Log the incoming form data for debugging
        const requestId = formData.get("requestId");
        const priority = formData.get("priority");
        
        console.log("Updating priority with:", { requestId, priority });
        
        // Check if requestId exists before validation
        if (!requestId) {
            console.error("Missing required field: requestId");
            return { 
                errors: { requestId: ["Required"] },
                message: 'Missing required request ID.'
            };
        }

        // First check if the request exists
        try {
            const existingRequest = await prisma.designRequest.findUnique({
                where: { id: requestId.toString() },
                select: { id: true }
            });
            
            if (!existingRequest) {
                console.error(`Design request with ID ${requestId} not found`);
                return {
                    errors: { requestId: ["Design request not found"] },
                    message: 'Design request not found. It may have been deleted.'
                };
            }
        } catch (error) {
            console.error("Error checking if design request exists:", error);
            return {
                errors: { database: ["Error checking design request"] },
                message: 'Database error: Unable to verify design request exists.'
            };
        }

        // Handle null priority case (clearing priority)
        const requestIdStr = requestId.toString();
        const priorityStr = priority?.toString();
        const isPriorityNull = priorityStr === 'null' || priorityStr === null || priorityStr === undefined;
        
        // If not null, validate against enum values
        if (!isPriorityNull) {
            // List all valid priority values for debugging
            const validPriorityValues = DesignPriority ? Object.values(DesignPriority) : PRIORITY_OPTIONS;
            console.log("Valid priority values:", validPriorityValues);
            
            // Check if priority is a valid DesignPriority enum value
            if (!validPriorityValues.includes(priorityStr as any)) {
                console.error(`Invalid priority value: "${priorityStr}". Valid values:`, validPriorityValues);
                return {
                    errors: { priority: [`Priority must be one of: ${validPriorityValues.join(', ')} or null`] },
                    message: 'Invalid priority value provided.'
                };
            }
        }

        // Direct database update with minimal processing
        try {
            await prisma.$transaction(async (tx) => {
                await tx.designRequest.update({
                    where: { id: requestIdStr },
                    data: { 
                        priority: isPriorityNull ? null : priorityStr as DesignPriority
                    },
                });
            });
            
            console.log(`Successfully updated priority for request ${requestIdStr} to ${isPriorityNull ? 'null' : priorityStr}`);
            
            // Revalidate paths for data refresh
            revalidatePath(`/admin/requests/${requestIdStr}`);
            revalidatePath('/admin/requests');
            
            return { 
                message: "Priority updated successfully.",
                // Include empty errors object for consistency
                errors: {}
            };
        } catch (updateError) {
            console.error("Specific database error during update:", updateError);
            return {
                errors: { database: ["Failed to update design request priority in database"] },
                message: `Database Error: ${updateError.message || 'Failed to update priority'}`
            };
        }
    } catch (error) {
        console.error("Unexpected error in updateDesignRequestPriority:", error);
        return { 
            message: "Unexpected error: Failed to update priority.", 
            errors: { server: [(error as Error).message || "Unknown server error"] } 
        };
    }
}


// --- Update Design Request Assignment ---
const UpdateAssignmentSchema = z.object({
    requestId: z.string().cuid(),
    assignedToId: z.string().nullable(), // Accept any string first, including null
});

export async function updateDesignRequestAssignment(formData: FormData) {
    try {
        await verifyAdmin();

        // Log the incoming form data for debugging
        const requestId = formData.get("requestId");
        const assignedToId = formData.get("assignedToId");
        
        console.log("Updating assignment with:", { requestId, assignedToId });
        
        // Check if requestId exists before validation
        if (!requestId) {
            console.error("Missing required field: requestId");
            return { 
                errors: { requestId: ["Required"] },
                message: 'Missing required request ID.' 
            };
        }

        // First check if the request exists
        try {
            const existingRequest = await prisma.designRequest.findUnique({
                where: { id: requestId.toString() },
                select: { id: true }
            });
            
            if (!existingRequest) {
                console.error(`Design request with ID ${requestId} not found`);
                return {
                    errors: { requestId: ["Design request not found"] },
                    message: 'Design request not found. It may have been deleted.'
                };
            }
        } catch (error) {
            console.error("Error checking if design request exists:", error);
            return {
                errors: { database: ["Error checking design request"] },
                message: 'Database error: Unable to verify design request exists.'
            };
        }

        // Handle null admin case (unassigning)
        const requestIdStr = requestId.toString();
        const assignedToIdStr = assignedToId?.toString();
        const isAssignmentNull = assignedToIdStr === 'null' || assignedToIdStr === null || assignedToIdStr === undefined;
        
        // If assigning to someone, check if admin exists
        if (!isAssignmentNull) {
            try {
                const admin = await prisma.user.findUnique({
                    where: { 
                        id: assignedToIdStr,
                        role: 'ADMIN'  // Make sure they're an admin
                    },
                    select: { id: true }
                });
                
                if (!admin) {
                    console.error(`Admin with ID ${assignedToIdStr} not found`);
                    return {
                        errors: { assignedToId: ["Admin user not found"] },
                        message: 'Admin user not found or user is not an admin.'
                    };
                }
            } catch (error) {
                console.error("Error checking if admin exists:", error);
                return {
                    errors: { database: ["Error checking admin user"] },
                    message: 'Database error: Unable to verify admin user exists.'
                };
            }
        }

        // Direct database update with minimal processing
        try {
            await prisma.$transaction(async (tx) => {
                await tx.designRequest.update({
                    where: { id: requestIdStr },
                    data: { 
                        assignedToId: isAssignmentNull ? null : assignedToIdStr 
                    },
                });
            });
            
            console.log(`Successfully updated assignment for request ${requestIdStr} to ${isAssignmentNull ? 'null' : assignedToIdStr}`);
            
            // Revalidate paths for data refresh
            revalidatePath(`/admin/requests/${requestIdStr}`);
            revalidatePath('/admin/requests');
            
            return { 
                message: "Assignment updated successfully.",
                // Include empty errors object for consistency
                errors: {}
            };
        } catch (updateError) {
            console.error("Specific database error during update:", updateError);
            return {
                errors: { database: ["Failed to update design request assignment in database"] },
                message: `Database Error: ${updateError.message || 'Failed to update assignment'}`
            };
        }
    } catch (error) {
        console.error("Unexpected error in updateDesignRequestAssignment:", error);
        return { 
            message: "Unexpected error: Failed to update assignment.", 
            errors: { server: [(error as Error).message || "Unknown server error"] } 
        };
    }
} 