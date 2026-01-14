import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Admin 권한 검증 헬퍼
async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { error: 'Unauthorized', status: 401 };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
        return { error: 'Forbidden: Admin access required', status: 403 };
    }

    return { user: session.user };
}

// GET: 관리자 통계 조회
export async function GET(request: NextRequest) {
    const auth = await verifyAdmin();
    if ('error' in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        // 병렬로 모든 통계 조회
        const [
            totalUsers,
            pendingUsers,
            activeUsers,
            proUsers,
            totalSermons,
            totalHighlights,
            totalPayments,
            recentUsers,
            recentSermons
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'PENDING' } }),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.user.count({ where: { plan: 'PRO' } }),
            prisma.sermon.count(),
            prisma.highlight.count(),
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: 'COMPLETED' }
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    status: true,
                    plan: true,
                    createdAt: true
                }
            }),
            prisma.sermon.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true }
                    },
                    _count: { select: { highlights: true } }
                }
            })
        ]);

        return NextResponse.json({
            stats: {
                users: {
                    total: totalUsers,
                    pending: pendingUsers,
                    active: activeUsers,
                    pro: proUsers
                },
                content: {
                    sermons: totalSermons,
                    highlights: totalHighlights
                },
                revenue: {
                    total: totalPayments._sum.amount || 0
                }
            },
            recent: {
                users: recentUsers,
                sermons: recentSermons
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin stats' },
            { status: 500 }
        );
    }
}
