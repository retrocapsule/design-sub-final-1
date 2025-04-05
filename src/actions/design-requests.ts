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
    url: z.string().url(),
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
                // Create related files if any were uploaded
                files: uploadedFiles && uploadedFiles.length > 0 ? {
                    createMany: {
                        data: uploadedFiles.map(file => ({
                            name: file.name,
                            url: file.url,
                            // Assuming size is useful to store, add key if needed too
                            // size: file.size,
                            // key: file.key,
                            userId: userId, // Associate file with the user who uploaded it
                        })),
                    }
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