import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get total counts
        const totalUsers = await prisma.user.count();
        const pendingApprovals = await prisma.user.count({
            where: { approvalStatus: 'pending' },
        });
        const activeSubscriptions = await prisma.user.count({
            where: { subscriptionStatus: 'pro' },
        });

        // Get total revenue (completed payments)
        const paymentsAggregate = await prisma.payment.aggregate({
            where: { status: 'completed' },
            _sum: { amount: true },
        });

        const totalRevenue = paymentsAggregate._sum.amount || 0;

        // Get monthly revenue
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthlyPayments = await prisma.payment.aggregate({
            where: {
                status: 'completed',
                createdAt: {
                    gte: firstDayOfMonth,
                },
            },
            _sum: { amount: true },
        });

        const monthlyRevenue = monthlyPayments._sum.amount || 0;

        // Get recent activities (videos analyzed)
        const recentVideos = await prisma.video.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({
            stats: {
                totalUsers,
                pendingApprovals,
                activeSubscriptions,
                totalRevenue,
                monthlyRevenue,
            },
            recentActivities: recentVideos,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
