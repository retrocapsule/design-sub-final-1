import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const templates = await prisma.designTemplate.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching design templates:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 