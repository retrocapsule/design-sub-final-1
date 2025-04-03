import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { URL } from 'url'; // Import URL for parsing query parameters

export async function GET(request: Request) {
  // Protect the route - only admins should access
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse URL to get query parameters
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Define query options
    let whereClause = {};
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause = { status: statusFilter };
    }

    // Fetch design requests with filtering and ordering
    const designRequests = await prisma.designRequest.findMany({
      where: whereClause,
      include: {
        user: { // Include relevant user details
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        // TODO: Include assignedTo user details if needed
        // assignedTo: {
        //   select: {
        //     id: true,
        //     name: true,
        //     email: true,
        //   }
        // }
      },
      orderBy: {
        createdAt: 'desc', // Show newest first
      },
    });

    return NextResponse.json(designRequests);

  } catch (error) {
    console.error('Error fetching design requests:', error);
    return NextResponse.json({ error: 'Failed to fetch design requests' }, { status: 500 });
  }
} 