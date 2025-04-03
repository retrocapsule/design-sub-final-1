import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params {
  params: { requestId: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const { requestId } = params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!requestId) {
        return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const designRequest = await prisma.designRequest.findUnique({
      where: {
        id: requestId,
        // Ensure the user owns the request or is an admin (add role check if needed)
        userId: session.user.id, 
      },
      // Include related data if necessary, e.g., comments, files
      // include: {
      //   files: true,
      //   comments: true,
      // }
    });

    if (!designRequest) {
      return NextResponse.json({ error: 'Request not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(designRequest);

  } catch (error) {
    console.error("Error fetching design request:", error);
    return NextResponse.json(
      { error: 'Failed to fetch design request' }, 
      { status: 500 }
    );
  }
}

// Placeholder for DELETE method
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const { requestId } = params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!requestId) {
        return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // TODO: Add delete logic here
    console.log(`Placeholder: Deleting request ${requestId} for user ${session.user.id}`);
    
    // Verify the user owns the request before deleting
    const requestToDelete = await prisma.designRequest.findUnique({
        where: { id: requestId, userId: session.user.id },
    });

    if (!requestToDelete) {
        return NextResponse.json({ error: 'Request not found or you do not have permission to delete it' }, { status: 404 });
    }
    
    // Perform the delete operation
    await prisma.designRequest.delete({
        where: { id: requestId },
    });

    return NextResponse.json({ message: 'Request deleted successfully' }, { status: 200 }); // Use 200 OK or 204 No Content

  } catch (error) {
    console.error("Error deleting design request:", error);
    return NextResponse.json(
      { error: 'Failed to delete design request' }, 
      { status: 500 }
    );
  }
}

// Placeholder for PUT/PATCH method (for editing)
export async function PUT(request: NextRequest, { params }: Params) {
    // TODO: Implement PUT logic
    return NextResponse.json({ message: 'Edit functionality (PUT) not yet implemented' }, { status: 501 });
}

export async function PATCH(request: NextRequest, { params }: Params) {
    // TODO: Implement PATCH logic
    return NextResponse.json({ message: 'Edit functionality (PATCH) not yet implemented' }, { status: 501 });
} 