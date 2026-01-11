const { Worker } = require('bullmq');
const { prisma } = require('../services/database');
const { analyzeVideoWithGemini } = require('../services/gemini');

console.log('🔧 Starting AI Analysis Worker...');

// Create worker
const worker = new Worker('video-processing', async (job) => {
    const { videoId, videoUrl, userId, title } = job.data;

    console.log(`📹 Processing job ${job.id} for video ${videoId}`);

    try {
        // Update status to analyzing
        await prisma.video.update({
            where: { id: videoId },
            data: { status: 'ANALYZING' },
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
        await prisma.video.update({
            where: { id: videoId },
            data: {
                status: 'COMPLETED',
                analysisData: analysisResult,
            },
        });

        console.log(`  ✓ Results saved to database`);

        // Create highlights
        if (analysisResult.highlights && analysisResult.highlights.length > 0) {
            const highlights = analysisResult.highlights.map((h, index) => ({
                videoId,
                title: h.title || `Highlight ${index + 1}`,
                startTime: h.startTime,
                endTime: h.endTime,
                caption: h.caption || '',
                platform: h.platform || 'youtube',
            }));

            await prisma.highlight.createMany({
                data: highlights,
            });

            console.log(`  ✓ Created ${highlights.length} highlights`);
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

        // Update video status to failed
        try {
            await prisma.video.update({
                where: { id: videoId },
                data: {
                    status: 'FAILED',
                    error: error.message,
                },
            });
        } catch (dbError) {
            console.error('Failed to update video status:', dbError);
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
