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
    const validation = submitRequestSchema.safeParse(values);
    if (!validation.success) {
        console.error("Server Action Validation Error:", validation.error.errors);
        return { success: false, message: "Invalid input data." };
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, message: "Authentication required." };
    }

    const { title, description, referenceLinks, uploadedFiles } = validation.data;
    const userId = session.user.id;

    try {
        await prisma.designRequest.create({
            data: {
                title,
                description,
                // TODO: Potentially parse referenceLinks string into structured data if needed
                // For now, assuming it's just stored as submitted text
                referenceLinks: referenceLinks || null, 
                userId,
                // Correct way to create related files within a nested create
                files: uploadedFiles && uploadedFiles.length > 0 ? {
                    create: uploadedFiles.map(file => ({
                        name: file.name,
                        // Use ufsUrl if available, otherwise fallback to url
                        url: file.ufsUrl || file.url || '', // Save to the DB 'url' field
                        key: file.key, // Store the key
                        // size: file.size, // Add size if you want to store it
                        userId: userId, // Associate file with the user
                        // Prisma automatically links this file to the DesignRequest being created
                    }))
                } : undefined,
            },
        });

        revalidatePath('/dashboard/requests'); // Revalidate the requests list page
        return { success: true, message: "Request submitted successfully!" };

    } catch (error) {
        console.error("Failed to create design request:", error);
        return { success: false, message: "Database error: Failed to submit request." };
    }
} 