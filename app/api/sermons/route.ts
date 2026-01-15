export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/sermons
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const isAdminRequest = searchParams.get('admin') === 'true';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Admin check if requested
        let effectiveWhere: any = { userId: session.user.id };

        if (isAdminRequest) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { role: true }
            });

            if (user?.role === 'ADMIN') {
                effectiveWhere = {}; // No filter for admin
            } else if (isAdminRequest) {
                return NextResponse.json(
                    { error: 'Forbidden: Admin access required' },
                    { status: 403 }
                );
            }
        }

        // Fetch sermons with pagination
        const [sermons, total] = await Promise.all([
            prisma.sermon.findMany({
                where: effectiveWhere,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    },
                    _count: {
                        select: { highlights: true }
                    }
                }
            }),
            prisma.sermon.count({ where: effectiveWhere })
        ]);

        return NextResponse.json({
            sermons,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('[API] Error fetching sermons:', error);
        console.error('[API] Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            { error: 'Failed to fetch sermons' },
            { status: 500 }
        );
    }
}
