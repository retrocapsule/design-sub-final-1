import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function PUT(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        // Check admin authorization
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { userId } = params;
        const { status } = await request.json();

        // Validate the request body
        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        // First, check if the user exists
        const user = await db.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user has a subscription
        if (!user.subscription) {
            return NextResponse.json(
                { error: 'User does not have a subscription' },
                { status: 400 }
            );
        }

        // Update the subscription status
        const updatedSubscription = await db.subscription.update({
            where: { id: user.subscription.id },
            data: { status },
            include: {
                package: true,
            },
        });

        // Return the updated subscription
        return NextResponse.json(updatedSubscription);
    } catch (error) {
        console.error('Error updating subscription status:', error);
        return NextResponse.json(
            { error: 'Failed to update subscription status' },
            { status: 500 }
        );
    }
} 