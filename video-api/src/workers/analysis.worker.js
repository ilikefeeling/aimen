const { Worker } = require('bullmq');
const { prisma } = require('../services/database');
const { analyzeVideoWithGemini } = require('../services/gemini');
const { extractClip, generateThumbnail, uploadToStorage } = require('../services/video-editor');
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const { Readable } = require('stream');

console.log('🔧 Starting AI Analysis Worker...');

// Create worker
const worker = new Worker('video-processing', async (job) => {
    const { videoId, videoUrl, userId, title } = job.data;

    console.log(`📹 Processing job ${job.id} for video ${videoId}`);

    try {
        // Update status to analyzing
        await prisma.sermon.update({
            where: { id: videoId },
            data: {
                analysisData: {
                    status: 'ANALYZING',
                    progress: 10,
                    startedAt: new Date().toISOString()
                }
            },
        });

        job.updateProgress(10);
        console.log(`  ✓ Status updated to ANALYZING`);

        // Fetch video from Supabase
        console.log(`  🔍 Fetching video from: ${videoUrl}`);
        job.updateProgress(20);

        // Call Gemini AI for analysis
        console.log(`  🤖 Starting Gemini AI analysis...`);
        const analysisResult = await analyzeVideoWithGemini(videoUrl, title, {
            onProgress: (percent) => {
                const progress = 20 + (percent * 0.6); // 20-80%
                job.updateProgress(Math.floor(progress));
                console.log(`  📊 Analysis progress: ${percent}%`);
            },
        });

        job.updateProgress(90);
        console.log(`  ✓ Analysis completed`);

        // Save results to database
        await prisma.sermon.update({
            where: { id: videoId },
            data: {
                analysisData: {
                    ...analysisResult,
                    status: 'COMPLETED',
                    progress: 100,
                    completedAt: new Date().toISOString()
                },
            },
        });

        console.log(`  ✓ Results saved to database`);

        // Create highlights in database
        if (analysisResult.highlights && analysisResult.highlights.length > 0) {
            console.log(`  📝 Processing ${analysisResult.highlights.length} highlights with video extraction...`);

            // 1. Download original video once
            const tempDir = path.join(__dirname, '../../temp');
            await fs.mkdir(tempDir, { recursive: true });
            const timestamp = Date.now();
            const inputPath = path.join(tempDir, `input-${videoId}-${timestamp}.mp4`);

            console.log(`     ⬇️  Downloading original video for clipping...`);
            const response = await fetch(videoUrl);
            if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);

            const fileStream = fsSync.createWriteStream(inputPath);
            await new Promise((resolve, reject) => {
                Readable.fromWeb(response.body).pipe(fileStream);
                fileStream.on('finish', resolve);
                fileStream.on('error', reject);
            });
            console.log(`     ✅ Download complete: ${inputPath}`);

            for (const h of analysisResult.highlights) {
                try {
                    // Create Highlight record
                    const highlight = await prisma.highlight.create({
                        data: {
                            sermonId: videoId,
                            title: h.title || 'Untitled Highlight',
                            startTime: parseInt(h.startTime) || 0,
                            endTime: parseInt(h.endTime) || 0,
                            caption: h.caption || '',
                            emotion: h.emotion || null,
                            platform: h.platform || null,
                            createdAt: new Date(),
                        },
                    });

                    console.log(`     ✨ Highlight created: ${highlight.id}`);

                    // Process Video Clipping
                    const clipTimestamp = Date.now();
                    const clipPath = path.join(tempDir, `clip-${highlight.id}-${clipTimestamp}.mp4`);
                    const thumbPath = path.join(tempDir, `thumb-${highlight.id}-${clipTimestamp}.jpg`);
                    const platform = h.platform?.includes('shorts') ? 'youtube' :
                        h.platform?.includes('reels') ? 'instagram' : 'youtube';

                    try {
                        // Extract clip
                        await extractClip(inputPath, clipPath, highlight.startTime, highlight.endTime, platform);

                        // Generate thumbnail
                        const midPoint = (highlight.endTime - highlight.startTime) / 2;
                        await generateThumbnail(clipPath, thumbPath, midPoint);

                        // Upload to Supabase
                        const clipFileName = `${videoId}/${highlight.id}-${platform}.mp4`;
                        const thumbFileName = `${videoId}/${highlight.id}-${platform}-thumb.jpg`;

                        const clipUrl = await uploadToStorage(clipPath, clipFileName, 'clips');
                        const thumbnailUrl = await uploadToStorage(thumbPath, thumbFileName, 'clips');

                        const stats = await fs.stat(clipPath).catch(() => null);

                        // Create Clip record
                        await prisma.clip.create({
                            data: {
                                highlightId: highlight.id,
                                platform: platform,
                                videoUrl: clipUrl,
                                thumbnailUrl: thumbnailUrl,
                                duration: highlight.endTime - highlight.startTime,
                                fileSize: stats ? stats.size : 0,
                                resolution: platform === 'facebook' ? '1080x1080' : '1080x1920',
                                status: 'COMPLETED'
                            }
                        });
                        console.log(`     ✅ Clip extracted and uploaded: ${highlight.title}`);

                        // Cleanup clip temp files
                        await fs.unlink(clipPath).catch(() => { });
                        await fs.unlink(thumbPath).catch(() => { });
                    } catch (clipError) {
                        console.error(`     ❌ Clipping failed for ${highlight.title}:`, clipError.message);
                        await prisma.clip.create({
                            data: {
                                highlightId: highlight.id,
                                platform: platform,
                                status: 'FAILED'
                            }
                        });
                    }
                } catch (highlightError) {
                    console.error(`  ⚠️ Failed to process highlight:`, highlightError.message);
                }
            }

            // Cleanup original temp video
            await fs.unlink(inputPath).catch(() => { });
            console.log(`     🗑️  Original temp video cleaned up`);
        }

        job.updateProgress(100);

        return {
            success: true,
            videoId,
            highlightsCount: analysisResult.highlights?.length || 0,
            message: 'Analysis completed successfully',
        };

    } catch (error) {
        console.error(`❌ Job ${job.id} failed:`, error);

        // Update sermon status to failed
        try {
            await prisma.sermon.update({
                where: { id: videoId },
                data: {
                    analysisData: {
                        status: 'FAILED',
                        error: error.message,
                        failedAt: new Date().toISOString()
                    },
                },
            });
        } catch (dbError) {
            console.error('Failed to update sermon status:', dbError);
        }

        throw error;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },
    concurrency: 2, // Process 2 jobs simultaneously
    limiter: {
        max: 10, // Max 10 jobs per duration
        duration: 60000, // 1 minute
    },
});

// Event listeners
worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed with error:`, err.message);
});

worker.on('progress', (job, progress) => {
    console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

worker.on('error', (err) => {
    console.error('Worker error:', err);
});

console.log(`✅ Worker started successfully`);
console.log(`   - Concurrency: 2`);
console.log(`   - Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing worker...');
    await worker.close();
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing worker...');
    await worker.close();
    await prisma.$disconnect();
    process.exit(0);
});
