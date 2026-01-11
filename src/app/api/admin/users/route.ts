import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: List all users
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const approvalStatus = searchParams.get('approvalStatus');

        const where: any = {};

        if (status) {
            where.subscriptionStatus = status;
        }

        if (approvalStatus) {
            where.approvalStatus = approvalStatus;
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                _count: {
                    select: {
                        videos: true,
                        payments: true,
                    },
                },
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// PATCH: Update user approval/subscription status
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { userId, approvalStatus, subscriptionStatus, subscriptionEndsAt } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};

        if (approvalStatus) {
            updateData.approvalStatus = approvalStatus;
        }

        if (subscriptionStatus) {
            updateData.subscriptionStatus = subscriptionStatus;
        }

        if (subscriptionEndsAt) {
            updateData.subscriptionEndsAt = new Date(subscriptionEndsAt);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE: Remove user
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
