const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const path = require('path');
const fs = require('fs/promises');
const { createClient } = require('@supabase/supabase-js');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Platform-specific video specifications
 */
const PLATFORM_SPECS = {
    youtube: {
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        name: 'YouTube Shorts'
    },
    youtube_shorts: {
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        name: 'YouTube Shorts'
    },
    instagram: {
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        name: 'Instagram Reels'
    },
    instagram_reels: {
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        name: 'Instagram Reels'
    },
    tiktok: {
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        name: 'TikTok'
    },
    reels: {
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        name: 'Instagram Reels'
    },
    facebook: {
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        name: 'Facebook'
    }
};

/**
 * Extract video clip from original video
 * @param {string} inputVideoPath - Path to original video
 * @param {string} outputPath - Path to save clipped video
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @param {string} platform - Target platform (youtube/instagram/facebook)
 * @returns {Promise<string>} Path to generated clip
 */
async function extractClip(inputVideoPath, outputPath, startTime, endTime, platform = 'youtube') {
    return new Promise((resolve, reject) => {
        const spec = PLATFORM_SPECS[platform] || PLATFORM_SPECS['youtube'];
        const duration = endTime - startTime;

        console.log(`📹 Extracting clip for ${spec.name} (${startTime}s to ${endTime}s)`);

        // Simplified filter for better compatibility
        const filter = spec.aspectRatio === '9:16'
            ? "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
            : "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080";

        // Place -ss BEFORE -i for fast seeking
        ffmpeg(inputVideoPath)
            .inputOptions([`-ss ${startTime}`])
            .duration(duration)
            .videoFilter(filter)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                '-preset superfast',
                '-crf 23',
                '-movflags +faststart'
            ])
            .output(outputPath)
            .on('start', (commandLine) => {
                console.log('📊 FFmpeg Clip Command:', commandLine);
            })
            .on('end', async () => {
                // Verify file existence and size
                try {
                    const stats = await fs.stat(outputPath).catch(() => null);
                    if (!stats || stats.size < 1000) {
                        return reject(new Error(`Clip extraction produced an invalid file (${stats?.size || 0} bytes)`));
                    }
                    console.log(`✅ Clip extraction completed successfully (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
                    resolve(outputPath);
                } catch (e) {
                    reject(e);
                }
            })
            .on('error', (err, stdout, stderr) => {
                console.error('❌ FFmpeg Clip Error:', err.message);
                console.error('📊 FFmpeg Clip Stderr:', stderr);
                reject(new Error(`FFmpeg Clip: ${err.message}\nStderr: ${stderr}`));
            })
            .run();
    });
}

/**
 * Generate thumbnail from video
 * @param {string} videoPath - Path to video file
 * @param {string} outputPath - Path to save thumbnail
 * @param {number} timeInSeconds - Timestamp for thumbnail
 * @returns {Promise<string>} Path to generated thumbnail
 */
async function generateThumbnail(videoPath, outputPath, timeInSeconds = 5) {
    const fs = require('fs').promises;

    const internalGenerate = async (vPath, outPath, time) => {
        return new Promise((resolve, reject) => {
            console.log(`🖼️  FFmpeg extracting frame from ${vPath} at ${time}s`);
            const { spawn } = require('child_process');
            const args = [
                '-i', vPath,
                '-ss', time.toString(),
                '-vframes', '1',
                '-q:v', '2',
                '-f', 'image2',
                '-y',
                outPath
            ];
            const proc = spawn(ffmpegPath, args);
            let stderr = '';
            proc.stderr.on('data', (data) => stderr += data.toString());
            proc.on('close', (code) => {
                if (code === 0) resolve(outPath);
                else {
                    console.error(`❌ FFmpeg Thumbnail Stderr: ${stderr}`);
                    reject(new Error(`FFmpeg Thumbnail exit ${code}: ${stderr}`));
                }
            });
            proc.on('error', (err) => reject(err));
        });
    };

    try {
        // First, check if the video file exists and is not empty
        const stats = await fs.stat(videoPath).catch(() => null);
        if (!stats || stats.size < 1000) {
            throw new Error(`Invalid video file for thumbnailing: ${videoPath} (${stats?.size || 0} bytes)`);
        }

        await internalGenerate(videoPath, outputPath, timeInSeconds);
        console.log('✅ Thumbnail generated successfully');
        return outputPath;
    } catch (error) {
        console.warn('⚠️  Thumbnail generation failed, but this might be expected if the clip is small. Error:', error.message);
        throw error;
    }
}

/**
 * Upload clip to Supabase Storage
 * @param {string} filePath - Local file path
 * @param {string} fileName - Destination file name in storage
 * @param {string} bucket - Storage bucket name
 * @returns {Promise<string>} Public URL of uploaded file
 */
async function uploadToStorage(filePath, fileName, bucket = 'videos') {
    try {
        console.log(`☁️  Uploading ${fileName} to Supabase...`);

        const fileBuffer = await fs.readFile(filePath);

        // Determine content type based on extension
        const ext = path.extname(fileName).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.mp4') contentType = 'video/mp4';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';

        console.log(`   - File: ${fileName}`);
        console.log(`   - Size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   - ContentType: ${contentType}`);

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, fileBuffer, {
                contentType,
                upsert: true
            });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        console.log('✅ Upload complete:', publicUrl);
        return publicUrl;

    } catch (error) {
        console.error('❌ Upload error:', error.message);
        throw error;
    }
}

/**
 * Clean up temporary files
 * @param {string[]} filePaths - Array of file paths to delete
 */
async function cleanup(filePaths) {
    for (const filePath of filePaths) {
        try {
            await fs.unlink(filePath);
            console.log(`🗑️  Cleaned up: ${filePath}`);
        } catch (error) {
            console.warn(`⚠️  Failed to delete ${filePath}:`, error.message);
        }
    }
}

/**
 * Process highlight clip generation
 * @param {Object} options
 * @param {string} options.videoUrl - Original video URL
 * @param {number} options.startTime - Start time in seconds
 * @param {number} options.endTime - End time in seconds
 * @param {string} options.platform - Target platform
 * @param {string} options.highlightId - Highlight ID for naming
 * @param {string} options.sermonId - Sermon ID for storage path
 * @returns {Promise<Object>} URLs of generated files
 */
async function processHighlightClip(options) {
    const {
        videoUrl,
        startTime,
        endTime,
        platform = 'youtube',
        highlightId,
        sermonId
    } = options;

    const tempDir = path.join(__dirname, '../../temp');
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const inputPath = path.join(tempDir, `input-${timestamp}.mp4`);
    const clipPath = path.join(tempDir, `clip-${timestamp}.mp4`);
    const thumbnailPath = path.join(tempDir, `thumb-${timestamp}.jpg`);

    try {
        // 1. Download original video (using streaming for memory efficiency)
        console.log('⬇️  Downloading video from:', videoUrl);
        const response = await fetch(videoUrl);

        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }

        const fileStream = require('fs').createWriteStream(inputPath);
        const { Readable } = require('stream');

        // Node native fetch response.body is a ReadableStream
        await new Promise((resolve, reject) => {
            Readable.fromWeb(response.body).pipe(fileStream);
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });

        // 2. Extract clip
        await extractClip(inputPath, clipPath, startTime, endTime, platform);

        // 3. Generate thumbnail (at middle of clip)
        const midPoint = (endTime - startTime) / 2;
        await generateThumbnail(clipPath, thumbnailPath, midPoint);

        // 4. Upload to Supabase
        const clipFileName = `${sermonId}/${highlightId}-${platform}.mp4`;
        const thumbFileName = `${sermonId}/${highlightId}-${platform}-thumb.jpg`;

        const clipUrl = await uploadToStorage(clipPath, clipFileName, 'clips');
        const thumbnailUrl = await uploadToStorage(thumbnailPath, thumbFileName, 'clips');

        // 5. Cleanup
        await cleanup([inputPath, clipPath, thumbnailPath]);

        // 6. Get file stats
        const stats = await fs.stat(clipPath).catch(() => null);
        const fileSize = stats ? stats.size : 0;

        return {
            clipUrl,
            thumbnailUrl,
            duration: endTime - startTime,
            fileSize,
            resolution: `${PLATFORM_SPECS[platform].width}x${PLATFORM_SPECS[platform].height}`,
            platform
        };

    } catch (error) {
        // Cleanup on error
        await cleanup([inputPath, clipPath, thumbnailPath]);
        throw error;
    }
}

module.exports = {
    extractClip,
    generateThumbnail,
    uploadToStorage,
    processHighlightClip,
    PLATFORM_SPECS
};
