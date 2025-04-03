import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for validating file data
const fileSchema = z.object({
  name: z.string().min(1, 'Filename is required'),
  url: z.string().min(1, 'URL is required'),
  size: z.number().int().positive('Size must be a positive number'),
  type: z.string().min(1, 'File type is required'),
  designRequestId: z.string().min(1, 'Design request ID is required'),
});

// POST /api/files - Create a new file record
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.error('POST /api/files: Unauthorized - No session');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('POST /api/files: Request body:', body);
    
    try {
      const validatedData = fileSchema.parse(body);
      console.log('POST /api/files: Validated data:', validatedData);

      // Verify that the design request exists and belongs to the user
      try {
        const designRequest = await prisma.designRequest.findUnique({
          where: {
            id: validatedData.designRequestId,
            ...(session.user.role !== 'ADMIN' && { userId: session.user.id }),
          },
        });

        if (!designRequest) {
          console.error('POST /api/files: Design request not found or unauthorized', {
            designRequestId: validatedData.designRequestId,
            userId: session.user.id,
            userRole: session.user.role
          });
          return NextResponse.json(
            { message: 'Design request not found or you do not have permission to add files to it' },
            { status: 404 }
          );
        }

        // Create the file record
        try {
          const file = await prisma.file.create({
            data: {
              name: validatedData.name,
              url: validatedData.url,
              size: validatedData.size,
              type: validatedData.type,
              designRequestId: validatedData.designRequestId,
              userId: session.user.id,
            },
          });
          
          console.log('POST /api/files: Created file:', file);
          return NextResponse.json(file, { status: 201 });
        } catch (createError) {
          console.error('POST /api/files: Error creating file record:', createError);
          return NextResponse.json(
            { message: 'Error creating file record in database', error: String(createError) },
            { status: 500 }
          );
        }
      } catch (findError) {
        console.error('POST /api/files: Error finding design request:', findError);
        return NextResponse.json(
          { message: 'Error finding design request', error: String(findError) },
          { status: 500 }
        );
      }
    } catch (zodError) {
      console.error('POST /api/files: Validation error:', zodError);
      if (zodError instanceof z.ZodError) {
        return NextResponse.json(
          { message: zodError.errors[0].message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: 'Validation error', error: String(zodError) },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('POST /api/files: Unhandled error:', error);
    return NextResponse.json(
      { message: 'Error creating file record', error: String(error) },
      { status: 500 }
    );
  }
} 