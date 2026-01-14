import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/sermons?userId={userId}
export async function GET(request: NextRequest) {
    try {
        console.log('[API] /api/sermons GET requested - URL:', request.url);

        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('[API] User authenticated:', session.user.id);
        console.log('[API] Attempting to query database with Prisma...');

        // Fetch sermons for the authenticated user
        const sermons = await prisma.sermon.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                title: true,
                videoUrl: true,
                churchName: true,
                analysisData: true,
                createdAt: true,
            },
        });

        console.log('[API] Query successful, found', sermons.length, 'sermons');

        return NextResponse.json({ sermons });
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
