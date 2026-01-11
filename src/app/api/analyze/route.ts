import { NextRequest, NextResponse } from 'next/server';
import { analyzeSermonTranscript, analyzeSermonVideo } from '@/lib/gemini/client';
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

        if (!user || user.approvalStatus !== 'approved') {
            return NextResponse.json(
                { error: 'User not approved for video analysis' },
                { status: 403 }
            );
        }

        // Create video record
        const video = await prisma.video.create({
            data: {
                userId,
                title,
                transcript: transcript || undefined,
                analysisStatus: 'processing',
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

            // Update video record with highlights
            await prisma.video.update({
                where: { id: video.id },
                data: {
                    highlights: highlights,
                    analysisStatus: 'completed',
                },
            });

            return NextResponse.json({
                success: true,
                videoId: video.id,
                highlights,
            });
        } catch (analysisError) {
            // Update video record with error status
            await prisma.video.update({
                where: { id: video.id },
                data: {
                    analysisStatus: 'failed',
                    analysisError: analysisError instanceof Error ? analysisError.message : 'Unknown error',
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
        const videoId = searchParams.get('videoId');

        if (!videoId) {
            return NextResponse.json(
                { error: 'Video ID is required' },
                { status: 400 }
            );
        }

        const video = await prisma.video.findUnique({
            where: { id: videoId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(video);
    } catch (error) {
        console.error('Error fetching video:', error);
        return NextResponse.json(
            { error: 'Failed to fetch video' },
            { status: 500 }
        );
    }
}
