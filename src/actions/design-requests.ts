'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Schema for uploaded file details (must match what UploadThing provides + our needs)
const uploadedFileSchema = z.object({
    key: z.string(), // Need key for potential future management if needed
    name: z.string(),
    // Update to expect ufsUrl, but make it optional initially for safety
    // and accept the old url as well during transition
    url: z.string().url().optional(), // Keep url for backward compatibility if needed
    ufsUrl: z.string().url().optional(), // Add the new field
    size: z.number(),
});

// Schema for the input to our Server Action
const submitRequestSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    referenceLinks: z.string().optional(),
    uploadedFiles: z.array(uploadedFileSchema).optional(),
});

export async function submitNewRequest(values: z.infer<typeof submitRequestSchema>) {
    console.log("[submitNewRequest] Starting with values:", JSON.stringify(values, null, 2));
    
    const validation = submitRequestSchema.safeParse(values);
    if (!validation.success) {
        console.error("[submitNewRequest] Validation Error:", JSON.stringify(validation.error.errors, null, 2));
        console.error("[submitNewRequest] Input that failed validation:", JSON.stringify(values, null, 2));
        return { success: false, message: "Invalid input data." };
    }
    console.log("[submitNewRequest] Validation successful");

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        console.error("[submitNewRequest] No user session found");
        return { success: false, message: "Authentication required." };
    }
    console.log("[submitNewRequest] User authenticated:", session.user.id);

    const { title, description, referenceLinks, uploadedFiles } = validation.data;
    const userId = session.user.id;

    // Log the extracted data
    console.log("[submitNewRequest] Extracted data:", {
        title,
        description,
        referenceLinks: referenceLinks || null,
        userId,
        uploadedFiles: uploadedFiles ? uploadedFiles.length : 0
    });

    try {
        // If there are uploaded files, prepare the file data
        let filesData = undefined;
        if (uploadedFiles && uploadedFiles.length > 0) {
            // Map the files to the format expected by Prisma
            const mappedFiles = uploadedFiles.map(file => {
                // Ensure file.url or file.ufsUrl is available
                const fileUrl = file.ufsUrl || file.url || '';
                if (!fileUrl) {
                    console.warn("[submitNewRequest] File missing URL:", file);
                }
                
                return {
                    name: file.name,
                    url: fileUrl,
                    key: file.key,
                    userId: userId
                };
            });
            
            console.log("[submitNewRequest] Preparing to create files:", JSON.stringify(mappedFiles, null, 2));
            filesData = { create: mappedFiles };
        }

        // Create the design request with the prepared file data
        const result = await prisma.designRequest.create({
            data: {
                title,
                description,
                referenceLinks: referenceLinks || null,
                userId,
                status: "PENDING", // Ensure status is set
                priority: "MEDIUM", // Set a default priority
                projectType: "GENERAL", // Set a default project type
                fileFormat: "ANY", // Set a default file format
                dimensions: "STANDARD", // Set a default dimension
                files: filesData
            },
            include: {
                files: true // Include files in the result for verification
            }
        });

        console.log("[submitNewRequest] Success! Created design request:", result.id);
        console.log("[submitNewRequest] Files created:", result.files.length);

        revalidatePath('/dashboard/requests'); // Revalidate the requests list page
        return { success: true, message: "Request submitted successfully!" };

    } catch (error) {
        console.error("[submitNewRequest] Database error:", error);
        // Provide more detailed error information
        if (error instanceof Error) {
            return { 
                success: false, 
                message: `Database error: ${error.message}`,
                error: error.stack 
            };
        }
        return { success: false, message: "Database error: Failed to submit request." };
    }
} 