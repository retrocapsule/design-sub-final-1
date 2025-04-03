import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Assuming your auth options are here

// Define the expected structure of the stats
interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  pendingDesignRequests: number;
  completedDesignRequests: number;
  // Added fields for recent data
  recentUsers: { id: string; name: string | null; email: string | null; createdAt: Date }[];
  recentPendingRequests: { id: string; title: string; createdAt: Date; user: { name: string | null; email: string | null } }[];
}

export async function GET(request: Request) {
  // Protect the route - only admins should access stats
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all counts and necessary data in parallel
    const [ 
      totalUsers, 
      activeSubscriptionsCount, 
      activeSubscriptionsData, 
      pendingDesignRequestsCount, // Renamed for clarity
      completedDesignRequestsCount, // Renamed for clarity
      recentUsersData, // Added
      recentPendingRequestsData // Added
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.subscription.count({ 
        where: { status: 'active' } // Assuming 'active' is the status string
      }),
      prisma.subscription.findMany({
        where: { status: 'active' },
        include: {
          package: { // Include related package to get the price
            select: { price: true }
          }
        }
      }),
      prisma.designRequest.count({ 
        where: { status: 'PENDING' } // Assuming 'PENDING' is the status string
      }),
      prisma.designRequest.count({ 
        where: { status: 'COMPLETED' } // Assuming 'COMPLETED' is the status string
      }),
      // Fetch 5 most recent users
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      // Fetch 5 most recent pending design requests
      prisma.designRequest.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } } // Include user details
        }
      })
    ]);

    // Calculate Monthly Recurring Revenue (MRR)
    const monthlyRecurringRevenue = activeSubscriptionsData.reduce((total, sub) => {
      // Add the package price if it exists, otherwise add 0
      return total + (sub.package?.price || 0);
    }, 0);

    const stats: AdminStats = {
      totalUsers,
      activeSubscriptions: activeSubscriptionsCount,
      monthlyRecurringRevenue, // MRR calculated from active subs
      pendingDesignRequests: pendingDesignRequestsCount,
      completedDesignRequests: completedDesignRequestsCount,
      recentUsers: recentUsersData,
      recentPendingRequests: recentPendingRequestsData.map(req => ({ // Ensure structure matches interface
        id: req.id,
        title: req.title,
        createdAt: req.createdAt,
        user: {
          name: req.user.name,
          email: req.user.email
        }
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin statistics' }, { status: 500 });
  }
} 