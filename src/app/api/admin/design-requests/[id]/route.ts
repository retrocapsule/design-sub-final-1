import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT handler for updating a specific design request
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Protect the route - only admins should access
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestId = params.id; // Get ID from the dynamic route segment
  
  try {
    const body = await request.json();
    const { status, assignedToId } = body; // Expect status and potentially assignedToId

    // Basic validation
    if (!status && !assignedToId) {
      return NextResponse.json({ error: 'No update data provided (e.g., status or assignedToId)' }, { status: 400 });
    }

    // Prepare data for update
    const updateData: { status?: string; assignedToId?: string | null } = {};
    if (status) {
      updateData.status = status;
    }
     if (assignedToId !== undefined) { // Allow unassigning by passing null
       updateData.assignedToId = assignedToId;
     }
    
    // Update the design request in the database
    const updatedRequest = await prisma.designRequest.update({
      where: { id: requestId },
      data: updateData,
      include: { // Include user details in the response like the GET route
         user: {
           select: {
             id: true,
             name: true,
             email: true,
           },
         },
         // Include assignedTo if needed
       },
    });

    return NextResponse.json(updatedRequest);

  } catch (error) {
    console.error(`Error updating design request ${requestId}:`, error);
    // Handle potential errors like request not found
    if (error instanceof Error && 'code' in error && error.code === 'P2025') { // Prisma specific error code for record not found
         return NextResponse.json({ error: 'Design request not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update design request' }, { status: 500 });
  }
}

// TODO: Add DELETE handler if needed in the future 