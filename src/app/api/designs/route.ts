import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all completed deliverables for the user's design requests
    const designs = await db.deliverable.findMany({
      where: {
        designRequest: {
          userId: session.user.id,
        },
        status: 'completed',
      },
      include: {
        designRequest: {
          select: {
            title: true,
            projectType: true,
            fileFormat: true,
            dimensions: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(designs);
  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { message: 'Error fetching designs' },
      { status: 500 }
    );
  }
} 