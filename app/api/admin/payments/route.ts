export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

// GET: 결제 내역 조회
export async function GET(request: NextRequest) {
    const auth = await verifyAdmin();
    if ('error' in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const [payments, total, stats] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            plan: true
                        }
                    }
                }
            }),
            prisma.payment.count({ where }),
            prisma.payment.aggregate({
                _sum: { amount: true },
                _count: true,
                where: { status: 'COMPLETED' }
            })
        ]);

        return NextResponse.json({
            payments,
            stats: {
                totalRevenue: stats._sum.amount || 0,
                totalTransactions: stats._count
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin payments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}

// POST: 구독 상태 변경 (수동 PRO 부여/해제)
export async function POST(request: NextRequest) {
    const auth = await verifyAdmin();
    if ('error' in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const body = await request.json();
        const { userId, action, amount, note } = body;

        if (!userId || !action) {
            return NextResponse.json(
                { error: 'userId and action are required' },
                { status: 400 }
            );
        }

        if (action === 'GRANT_PRO') {
            // PRO 권한 부여 및 결제 기록 생성
            const [user, payment] = await prisma.$transaction([
                prisma.user.update({
                    where: { id: userId },
                    data: { plan: 'PRO' }
                }),
                prisma.payment.create({
                    data: {
                        userId,
                        amount: amount || 0,
                        status: 'COMPLETED',
                        paymentKey: `ADMIN_GRANT_${Date.now()}`
                    }
                })
            ]);

            return NextResponse.json({
                message: 'PRO plan granted successfully',
                user: { id: user.id, plan: user.plan },
                payment
            });
        }

        if (action === 'REVOKE_PRO') {
            // PRO 권한 해제
            const user = await prisma.user.update({
                where: { id: userId },
                data: { plan: 'FREE' }
            });

            return NextResponse.json({
                message: 'PRO plan revoked',
                user: { id: user.id, plan: user.plan }
            });
        }

        return NextResponse.json(
            { error: 'Invalid action. Use GRANT_PRO or REVOKE_PRO' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Admin payment action error:', error);
        return NextResponse.json(
            { error: 'Failed to process payment action' },
            { status: 500 }
        );
    }
}
