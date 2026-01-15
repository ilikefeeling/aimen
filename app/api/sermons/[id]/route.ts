import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/sermons/[id]
export async function GET(
    request: NextRequest,
    context: any
) {
    try {
        console.log('[API] Full Context:', JSON.stringify(context));
        const params = await context.params;
        const id = params?.id;
        console.log('[API] Extracted ID:', id);

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!id) {
            console.error('[API] Missing ID in params. Params:', params, 'Context keys:', Object.keys(context));
            return NextResponse.json(
                {
                    error: `Sermon ID is required in [id] route`,
                    debug: {
                        id,
                        params,
                        contextKeys: Object.keys(context)
                    }
                },
                { status: 400 }
            );
        }

        // Fetch sermon with highlights - ensure it belongs to the user
        const sermon = await prisma.sermon.findUnique({
            where: {
                id: id,
                userId: session.user.id,
            },
            include: {
                highlights: {
                    include: {
                        clips: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        if (!sermon) {
            return NextResponse.json(
                { error: 'Sermon not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            sermon: {
                id: sermon.id,
                title: sermon.title,
                videoUrl: sermon.videoUrl,
                churchName: sermon.churchName,
                analysisData: sermon.analysisData,
                createdAt: sermon.createdAt,
            },
            highlights: sermon.highlights,
        });
    } catch (error) {
        console.error('Error fetching sermon details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sermon details' },
            { status: 500 }
        );
    }
}
// DELETE /api/sermons/[id]
export async function DELETE(
    request: NextRequest,
    context: any
) {
    try {
        const params = await context.params;
        const id = params?.id;

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
        }

        // 1. Fetch sermon to check ownership and existence
        const sermon = await prisma.sermon.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!sermon) {
            return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
        }

        // 2. Check authorization (Admin or Owner)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        const isOwner = sermon.userId === session.user.id;
        const isAdmin = user?.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. Perform Cascading Delete in Transaction
        await prisma.$transaction(async (tx) => {
            // Delete Clips related to this sermon's highlights
            await tx.clip.deleteMany({
                where: {
                    highlight: {
                        sermonId: id
                    }
                }
            });

            // Delete Highlights
            await tx.highlight.deleteMany({
                where: {
                    sermonId: id
                }
            });

            // Delete the Sermon
            await tx.sermon.delete({
                where: { id }
            });
        });

        return NextResponse.json({ message: 'Sermon deleted successfully' });
    } catch (error) {
        console.error('Error deleting sermon:', error);
        return NextResponse.json(
            { error: 'Failed to delete sermon' },
            { status: 500 }
        );
    }
}
