export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { analyzeSermonTranscript, analyzeSermonVideo, timeToSeconds } from '@/lib/gemini/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for video processing

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const videoFile = formData.get('video') as File | null;
        const transcript = formData.get('transcript') as string | null;
        const userId = formData.get('userId') as string;
        const title = formData.get('title') as string || 'Untitled Sermon';

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Check if user is approved
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'User not approved for video analysis' },
                { status: 403 }
            );
        }

        // Create sermon record
        const sermon = await prisma.sermon.create({
            data: {
                userId,
                title,
                videoUrl: '', // Will be updated if file upload is involved
                analysisData: { status: 'PROCESSING' },
            },
        });

        let highlights;

        try {
            // Analyze using transcript or video file
            if (transcript) {
                console.log('Analyzing transcript...');
                highlights = await analyzeSermonTranscript(transcript);
            } else if (videoFile) {
                console.log('Analyzing video file...');
                highlights = await analyzeSermonVideo(videoFile);
            } else {
                throw new Error('Either transcript or video file is required');
            }

            // Update sermon record with highlights and analysis results
            const aiHighlights = highlights as any[];
            await prisma.sermon.update({
                where: { id: sermon.id },
                data: {
                    analysisData: {
                        status: 'COMPLETED',
                        summary: aiHighlights[0]?.summary || '',
                    },
                    highlights: {
                        create: aiHighlights.map((h: any) => ({
                            title: h.title,
                            startTime: typeof h.start_time === 'string' ? timeToSeconds(h.start_time) : 0,
                            endTime: typeof h.end_time === 'string' ? timeToSeconds(h.end_time) : 60,
                            caption: h.caption,
                        }))
                    }
                },
            });

            return NextResponse.json({
                success: true,
                sermonId: sermon.id,
                highlights,
            });
        } catch (analysisError) {
            // Update sermon record with error status
            await prisma.sermon.update({
                where: { id: sermon.id },
                data: {
                    analysisData: {
                        status: 'FAILED',
                        error: analysisError instanceof Error ? analysisError.message : 'Unknown error',
                    }
                },
            });

            throw analysisError;
        }
    } catch (error) {
        console.error('Error in analyze API:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to analyze video' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sermonId = searchParams.get('sermonId');

        if (!sermonId) {
            return NextResponse.json(
                { error: 'Sermon ID is required' },
                { status: 400 }
            );
        }

        const sermon = await prisma.sermon.findUnique({
            where: { id: sermonId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                highlights: true,
            },
        });

        if (!sermon) {
            return NextResponse.json(
                { error: 'Sermon not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(sermon);
    } catch (error) {
        console.error('Error fetching sermon:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sermon' },
            { status: 500 }
        );
    }
}
