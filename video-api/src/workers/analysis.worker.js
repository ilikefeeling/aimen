// Load environment variables from root .env
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Worker } = require('bullmq');
const { prisma } = require('../services/database');
const { analyzeVideoWithGemini } = require('../services/gemini');
const { generateDubbedAudio, dubVideoClip, createVoiceClone } = require('../services/elevenlabs');
const { generateLipsyncVideo } = require('../services/heygen');
const { extractClip, generateThumbnail, uploadToStorage, PLATFORM_SPECS, extractAudio } = require('../services/video-editor');
const { checkGeminiAuth } = require('../utils/health');
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const os = require('os');
const { Readable } = require('stream');

console.log('🔧 Starting AI Analysis Worker...');

// Create worker
const worker = new Worker('video-processing', async (job) => {
    const { videoId, videoUrl, userId, title, targetLanguages = ['korean'], dubbingTone = 'professional' } = job.data;

    console.log(`📹 Processing job ${job.id} for video ${videoId} (Languages: ${targetLanguages.join(', ')})`);

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
                    progress: 5,
                    startedAt: new Date().toISOString(),
                    targetLanguages
                }
            },
        });

        job.updateProgress(5);

        // 1. Download original video once
        const tempDir = path.join(os.tmpdir(), 'aimen-video-temp');
        await fs.mkdir(tempDir, { recursive: true });
        const timestamp = Date.now();
        const inputPath = path.join(tempDir, `input-${videoId}-${timestamp}.mp4`);

        console.log(`     ⬇️  Downloading original video...`);
        const response = await fetch(videoUrl);
        if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);

        const fileStream = fsSync.createWriteStream(inputPath);
        await new Promise((resolve, reject) => {
            Readable.fromWeb(response.body).pipe(fileStream);
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });
        console.log(`     ✅ Download complete: ${inputPath}`);

        // 1.5 Extract Voice Sample and Clone (New Feature)
        let clonedVoiceId = null;
        if (targetLanguages.length > 1) { // If non-korean languages are selected
            const samplePath = path.join(tempDir, `sample-${videoId}.mp3`);

            await prisma.sermon.update({
                where: { id: videoId },
                data: { analysisData: { ...job.data.analysisData, currentStep: '🎙️ 화자 목소리 추출 중...', progress: 15 } }
            });
            job.updateProgress({ progress: 15, currentStep: '🎙️ 화자 목소리 추출 중...' });

            try {
                // Extract first 60 seconds for cloning
                await extractAudio(inputPath, samplePath, 0, 60);

                await prisma.sermon.update({
                    where: { id: videoId },
                    data: { analysisData: { ...job.data.analysisData, currentStep: '🧠 AI 목소리 클로닝 중...', progress: 18 } }
                });
                job.updateProgress({ progress: 18, currentStep: '🧠 AI 목소리 클로닝 중...' });

                clonedVoiceId = await createVoiceClone(samplePath, `${title} - Pastor`);

                // Cleanup sample
                await fs.unlink(samplePath).catch(() => { });
            } catch (err) {
                console.error('⚠️ Voice cloning failed, falling back to professional voice:', err.message);
            }
        }
        job.updateProgress({ progress: 20, currentStep: '🤖 베이스 분석 시작...' });

        // 2. Base Analysis (Korean) - To get highlights timestamps
        console.log(`  🤖 Starting Base Analysis (Korean)...`);
        const baseResult = await analyzeVideoWithGemini(videoUrl, title, {
            targetLanguage: 'korean',
            onProgress: (percent) => {
                const progress = 20 + (percent * 0.15); // 20-35%
                job.updateProgress({ progress: Math.floor(progress), currentStep: '📖 설교 내용 분석 중 (한국어)...' });
            }
        });

        await prisma.sermon.update({
            where: { id: videoId },
            data: { analysisData: { ...baseResult, currentStep: '📖 설교 내용 분석 중 (한국어)...', progress: 35 } }
        });

        // Store base results
        const masterAnalysisData = {
            ...baseResult,
            translations: {},
            status: 'PROCESSING_CLIPS',
            progress: 35,
            completedAt: null
        };

        await prisma.sermon.update({
            where: { id: videoId },
            data: { analysisData: masterAnalysisData },
        });

        // 3. Process each language
        const totalLangs = targetLanguages.length;
        for (let i = 0; i < totalLangs; i++) {
            const lang = targetLanguages[i];
            console.log(`🌍 Processing Language [${i + 1}/${totalLangs}]: ${lang}`);

            let langResult = baseResult;
            if (lang !== 'korean') {
                // For non-korean, call Gemini again for translation (or translate via prompt)
                // For accuracy and STT sync, we call the full analysis for the target language
                await prisma.sermon.update({
                    where: { id: videoId },
                    data: { analysisData: { ...masterAnalysisData, currentStep: `🌍 ${lang} 번역 및 분석 중...`, progress: 35 + (i * (60 / totalLangs)) } }
                });

                langResult = await analyzeVideoWithGemini(videoUrl, title, {
                    targetLanguage: lang,
                    onProgress: (percent) => {
                        const baseProgress = 35 + (i * (60 / totalLangs));
                        const stepProgress = (percent * (60 / totalLangs) * 0.3);
                        const totalProgress = Math.floor(baseProgress + stepProgress);
                        job.updateProgress({ progress: totalProgress, currentStep: `🌍 ${lang} 번역 및 분석 중...` });
                    }
                });
                masterAnalysisData.translations[lang] = langResult;
            }

            // Generate Highlights and Clips for this language
            if (langResult.highlights && langResult.highlights.length > 0) {
                for (const h of langResult.highlights) {
                    try {
                        // Find or Create Highlight (Base timestamps should match)
                        // We use the Korean version as the master for ID if possible, but for now simple creation
                        let highlight = await prisma.highlight.findFirst({
                            where: { sermonId: videoId, startTime: parseInt(h.startTime) }
                        });

                        if (!highlight) {
                            highlight = await prisma.highlight.create({
                                data: {
                                    sermonId: videoId,
                                    title: h.title || 'Untitled',
                                    startTime: parseInt(h.startTime) || 0,
                                    endTime: parseInt(h.endTime) || 0,
                                    caption: h.caption || '',
                                    emotion: h.emotion || null,
                                    platform: h.platform || null,
                                },
                            });
                        }

                        // Process Video Clipping for this language
                        const clipTimestamp = Date.now();
                        const clipPath = path.join(tempDir, `clip-${highlight.id}-${lang}-${clipTimestamp}.mp4`);
                        const thumbPath = path.join(tempDir, `thumb-${highlight.id}-${lang}-${clipTimestamp}.jpg`);
                        const targetPlatform = h.platform?.includes('shorts') ? 'youtube_shorts' :
                            h.platform?.includes('reels') ? 'instagram_reels' : 'youtube_shorts';

                        // 1. Extract clip
                        await extractClip(inputPath, clipPath, highlight.startTime, highlight.endTime, targetPlatform);

                        // 2. Generate thumbnail
                        try { await generateThumbnail(clipPath, thumbPath, 1); } catch (e) { }

                        // 3. AI Dubbing (Only for non-korean)
                        let dubbedUrl = null;
                        if (lang !== 'korean') {
                            try {
                                const dubbedAudioPath = await generateDubbedAudio(h.caption, {
                                    targetLanguage: lang,
                                    tone: dubbingTone,
                                    voiceId: clonedVoiceId // Use cloned voice if available
                                });
                                const dubbedClipPath = path.join(tempDir, `dubbed-${highlight.id}-${lang}-${Date.now()}.mp4`);
                                await dubVideoClip(clipPath, dubbedAudioPath, dubbedClipPath);

                                // 3.5. AI Lipsync (HeyGen 연동 - 선택 사항)
                                if (process.env.HEYGEN_API_KEY) {
                                    try {
                                        await prisma.sermon.update({
                                            where: { id: videoId },
                                            data: { analysisData: { ...masterAnalysisData, currentStep: `👄 ${lang} 립싱크 보정 중 (HeyGen)...`, progress: job.progress } }
                                        });

                                        const lipsyncedUrl = await generateLipsyncVideo(clipPath, dubbedAudioPath);
                                        if (lipsyncedUrl) {
                                            console.log(`✅ HeyGen Lipsync completed for ${lang}:`, lipsyncedUrl);
                                            dubbedUrl = lipsyncedUrl; // Use lipsynced version
                                        }
                                    } catch (heygenErr) {
                                        console.error(`⚠️ HeyGen Lipsync failed for ${lang}:`, heygenErr.message);
                                    }
                                }

                                dubbedUrl = dubbedUrl || await uploadToStorage(dubbedClipPath, `${videoId}/${highlight.id}-${lang}-dubbed.mp4`);

                                // Clean up dubbed temp files
                                [dubbedAudioPath, dubbedClipPath].forEach(p => { try { if (fsSync.existsSync(p)) fsSync.unlinkSync(p); } catch (e) { } });
                            } catch (dubErr) { console.error(`⚠️ Dubbing failed for ${lang}:`, dubErr.message); }
                        }

                        // 4. Upload standard clip (original audio with target language captions in metadata or for display)
                        const clipUrl = await uploadToStorage(clipPath, `${videoId}/${highlight.id}-${lang}.mp4`);
                        const thumbnailUrl = await uploadToStorage(thumbPath, `${videoId}/${highlight.id}-${lang}-thumb.jpg`);

                        // 5. Save Clip record
                        await prisma.clip.create({
                            data: {
                                highlightId: highlight.id,
                                platform: targetPlatform,
                                language: lang,
                                videoUrl: clipUrl,
                                dubbedUrl: dubbedUrl,
                                thumbnailUrl: thumbnailUrl,
                                duration: highlight.endTime - highlight.startTime,
                                resolution: '1080x1920',
                                status: 'COMPLETED'
                            }
                        });

                        // Clean up
                        [clipPath, thumbPath].forEach(p => { try { if (fsSync.existsSync(p)) fsSync.unlinkSync(p); } catch (e) { } });

                    } catch (err) {
                        console.error(`❌ Error processing highlight in ${lang}:`, err.message);
                    }
                }
            }
        }

        // Final completion update
        await prisma.sermon.update({
            where: { id: videoId },
            data: {
                analysisData: {
                    ...masterAnalysisData,
                    status: 'COMPLETED',
                    progress: 100,
                    completedAt: new Date().toISOString()
                },
            },
        });

        // Cleanup original
        await fs.unlink(inputPath).catch(() => { });
        job.updateProgress(100);

        return { success: true, videoId, languagesProcessed: targetLanguages };

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
