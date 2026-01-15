// Load environment variables from root .env
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Worker } = require('bullmq');
const { prisma } = require('../services/database');
const { analyzeVideoWithGemini } = require('../services/gemini');
const { extractClip, generateThumbnail, uploadToStorage, PLATFORM_SPECS } = require('../services/video-editor');
const { checkGeminiAuth } = require('../utils/health');
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
        // 0. Health Check
        console.log('🔍 Checking Gemini API health...');
        const health = await checkGeminiAuth();
        if (!health.valid) {
            throw new Error(`Gemini API Health Check Failed: ${health.message}`);
        }

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
                    const targetPlatform = h.platform?.includes('shorts') ? 'youtube_shorts' :
                        h.platform?.includes('reels') ? 'instagram_reels' :
                            PLATFORM_SPECS[h.platform] ? h.platform : 'youtube_shorts';

                    console.log(`📹 Processing highlight: ${highlight.title} (${targetPlatform})`);

                    try {
                        // 1. Extract clip
                        console.log(`     ✂️  Extracting clip using platform: ${targetPlatform}`);
                        await extractClip(inputPath, clipPath, highlight.startTime, highlight.endTime, targetPlatform);
                        console.log(`     ✅ Clip extracted to: ${clipPath}`);

                        // 2. Generate thumbnail with Fallback
                        console.log(`     🖼️  Generating thumbnail...`);
                        try {
                            // Try from clip first at 1s
                            await generateThumbnail(clipPath, thumbPath, 1);
                        } catch (thumbErr) {
                            console.warn(`     ⚠️  Thumbnail from clip failed (${thumbErr.message}), trying from source...`);
                            // Fallback: extract from original input video at startTime + 1s
                            await generateThumbnail(inputPath, thumbPath, highlight.startTime + 1);
                        }
                        console.log(`     ✅ Thumbnail generated to: ${thumbPath}`);

                        // 3. Upload to storage
                        console.log(`     ☁️  Uploading files to Supabase...`);
                        const clipUrl = await uploadToStorage(clipPath, `${videoId}/${highlight.id}-${Date.now()}.mp4`);
                        const thumbnailUrl = await uploadToStorage(thumbPath, `${videoId}/${highlight.id}-thumb-${Date.now()}.jpg`);

                        // 4. Save to database
                        await prisma.clip.create({
                            data: {
                                highlightId: highlight.id,
                                platform: highlight.platform || 'youtube_shorts',
                                videoUrl: clipUrl,
                                thumbnailUrl: thumbnailUrl,
                                duration: highlight.endTime - highlight.startTime,
                                resolution: highlight.platform === 'facebook' ? '1080x1080' : '1080x1920',
                                status: 'COMPLETED'
                            }
                        });

                        console.log(`✅ Completed highlight: ${highlight.title}`);
                    } catch (err) {
                        console.error(`❌ Failed processing highlight ${highlight.title}:`, err.message);

                        // Always create a FAILED record with all required fields
                        await prisma.clip.create({
                            data: {
                                highlightId: highlight.id,
                                platform: highlight.platform || 'youtube_shorts',
                                status: 'FAILED',
                                duration: 0,
                                resolution: highlight.platform === 'facebook' ? '1080x1080' : '1080x1920'
                            }
                        });
                    } finally {
                        try { if (require('fs').existsSync(clipPath)) require('fs').unlinkSync(clipPath); } catch (e) { }
                        try { if (require('fs').existsSync(thumbPath)) require('fs').unlinkSync(thumbPath); } catch (e) { }
                    }
                } catch (highlightError) {
                    console.error(`  ❌ CRITICAL: Failed to process highlight loop:`, highlightError);
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
