import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Check admin authorization
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build the query
        let query: any = {
            include: {
                subscription: {
                    include: {
                        package: true,
                    },
                },
            },
        };

        // If status is provided and not 'ALL', add it to the filter
        if (status && status !== 'ALL') {
            if (status === 'NONE') {
                // Filter users with no subscription
                query.where = {
                    subscription: null,
                };
            } else {
                // Filter by subscription status
                query.where = {
                    subscription: {
                        status,
                    },
                };
            }
        }

        // If search is provided, add name/email search
        if (search) {
            const searchFilter = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                ],
            };

            // Combine with existing where condition if any
            query.where = query.where ? { AND: [query.where, searchFilter] } : searchFilter;
        }

        // Execute the query
        const users = await db.user.findMany(query);

        // Return the results
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
} 