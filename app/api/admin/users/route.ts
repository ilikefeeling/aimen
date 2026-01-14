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

// GET: 사용자 목록 조회
export async function GET(request: NextRequest) {
    const auth = await verifyAdmin();
    if ('error' in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const plan = searchParams.get('plan');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: any = {};

        if (status && ['PENDING', 'ACTIVE'].includes(status)) {
            where.status = status;
        }
        if (plan && ['FREE', 'PRO'].includes(plan)) {
            where.plan = plan;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    status: true,
                    plan: true,
                    createdAt: true,
                    _count: {
                        select: { sermons: true, payments: true }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// PATCH: 사용자 상태/플랜 변경
export async function PATCH(request: NextRequest) {
    const auth = await verifyAdmin();
    if ('error' in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const body = await request.json();
        const { userId, status, plan, role } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (status && ['PENDING', 'ACTIVE'].includes(status)) {
            updateData.status = status;
        }
        if (plan && ['FREE', 'PRO'].includes(plan)) {
            updateData.plan = plan;
        }
        if (role && ['USER', 'ADMIN'].includes(role)) {
            updateData.role = role;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                plan: true
            }
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Admin user update error:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
