import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// Get a specific customer by ID
export async function GET(
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

        // Get the user with related data
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                subscription: {
                    include: {
                        package: true,
                    },
                },
                designRequests: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 5, // Limit to recent requests
                },
                accounts: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get active packages for dropdown options
        const packages = await db.package.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });

        return NextResponse.json({ user, packages });
    } catch (error) {
        console.error('Error fetching customer details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer details' },
            { status: 500 }
        );
    }
}

// Update customer data
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
        const data = await request.json();

        // Validate user exists
        const existingUser = await db.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Handle potential user updates
        const userUpdateData: any = {};
        
        if (data.name !== undefined) userUpdateData.name = data.name;
        if (data.email !== undefined) userUpdateData.email = data.email;
        if (data.role !== undefined) userUpdateData.role = data.role;
        if (data.onboardingCompleted !== undefined) userUpdateData.onboardingCompleted = data.onboardingCompleted;

        // Update basic user info if there are changes
        if (Object.keys(userUpdateData).length > 0) {
            await db.user.update({
                where: { id: userId },
                data: userUpdateData,
            });
        }

        // Handle subscription updates
        if (data.subscriptionUpdate) {
            const { action, packageId, status } = data.subscriptionUpdate;
            
            if (action === 'create' && packageId) {
                // Create new subscription
                if (existingUser.subscription) {
                    return NextResponse.json(
                        { error: 'User already has a subscription' },
                        { status: 400 }
                    );
                }
                
                await db.subscription.create({
                    data: {
                        userId,
                        packageId,
                        status: status || 'ACTIVE',
                    },
                });
            } 
            else if (action === 'update' && existingUser.subscription) {
                // Update existing subscription
                const updateData: any = {};
                
                if (packageId) updateData.packageId = packageId;
                if (status) updateData.status = status;
                
                if (Object.keys(updateData).length > 0) {
                    await db.subscription.update({
                        where: { id: existingUser.subscription.id },
                        data: updateData,
                    });
                }
            }
            else if (action === 'delete' && existingUser.subscription) {
                // Delete subscription
                await db.subscription.delete({
                    where: { id: existingUser.subscription.id },
                });
            }
        }

        // Get the updated user to return
        const updatedUser = await db.user.findUnique({
            where: { id: userId },
            include: {
                subscription: {
                    include: {
                        package: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
} 