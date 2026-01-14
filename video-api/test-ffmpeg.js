require('dotenv').config();
const { extractClip, generateThumbnail } = require('./src/services/video-editor');
const path = require('path');
const fs = require('fs/promises');

async function testFFmpeg() {
    console.log('🧪 Starting FFmpeg Test...\n');

    // Sample video URL (a short 10s video from a reliable source)
    const videoUrl = 'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4';

    const tempDir = path.join(__dirname, 'temp-test');
    await fs.mkdir(tempDir, { recursive: true });

    const inputPath = path.join(tempDir, 'input.mp4');
    const clipPath = path.join(tempDir, 'clip.mp4');
    const thumbPath = path.join(tempDir, 'thumb.jpg');

    try {
        // 1. Download
        console.log('⬇️  Downloading sample video...');
        const response = await fetch(videoUrl);
        if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        await fs.writeFile(inputPath, Buffer.from(buffer));
        console.log('✅ Download complete\n');

        // 2. Extract Clip (first 5 seconds)
        console.log('📹 Extracting 5s clip (YouTube Shorts format)...');
        await extractClip(inputPath, clipPath, 0, 5, 'youtube');
        console.log('✅ Clip extraction successful\n');

        // 3. Generate Thumbnail
        console.log('🖼️  Generating thumbnail at 2.5s...');
        await generateThumbnail(clipPath, thumbPath, 2.5);
        console.log('✅ Thumbnail generation successful\n');

        console.log('🎉 ALL FFmpeg TESTS PASSED!');
        console.log(`   Clip: ${clipPath}`);
        console.log(`   Thumb: ${thumbPath}`);

    } catch (err) {
        console.error('❌ TEST FAILED');
        console.error(err);
    }
}

testFFmpeg();
