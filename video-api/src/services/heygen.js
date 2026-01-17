const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

/**
 * HeyGen Lipsync Service
 */
async function generateLipsyncVideo(videoPath, audioPath) {
    if (!HEYGEN_API_KEY) {
        console.warn('⚠️ HEYGEN_API_KEY is missing. Skipping lipsync.');
        return null;
    }

    try {
        console.log('👄 Starting HeyGen Lipsync process...');

        // 1. Upload Video Asset
        const videoAssetId = await uploadAsset(videoPath, 'video');
        console.log('✅ Video asset uploaded:', videoAssetId);

        // 2. Upload Audio Asset
        const audioAssetId = await uploadAsset(audioPath, 'audio');
        console.log('✅ Audio asset uploaded:', audioAssetId);

        // 3. Create Lipsync Job
        // Using HeyGen v2/videogen endpoint for talking photo/video
        const response = await axios({
            method: 'post',
            url: 'https://api.heygen.com/v2/video/generate',
            headers: {
                'X-Api-Key': HEYGEN_API_KEY,
                'Content-Type': 'application/json'
            },
            data: {
                video_inputs: [
                    {
                        character: {
                            type: 'video',
                            video_asset_id: videoAssetId
                        },
                        voice: {
                            type: 'audio',
                            audio_asset_id: audioAssetId
                        }
                    }
                ],
                dimension: {
                    width: 1080,
                    height: 1920
                }
            }
        });

        const videoId = response.data.data.video_id;
        console.log('🎬 HeyGen job created:', videoId);

        // 4. Poll for completion
        const finalUrl = await pollVideoStatus(videoId);
        return finalUrl;

    } catch (error) {
        console.error('❌ HeyGen Lipsync Error:', error.response?.data || error.message);
        return null; // Fallback to non-lipsynced version
    }
}

async function uploadAsset(filePath, type) {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios({
        method: 'post',
        url: `https://api.heygen.com/v1/asset/upload?type=${type}`,
        headers: {
            'X-Api-Key': HEYGEN_API_KEY,
            ...form.getHeaders()
        },
        data: form
    });

    return response.data.data.id || response.data.data.asset_id;
}

async function pollVideoStatus(videoId) {
    const maxAttempts = 300; // 5 minutes max
    let attempts = 0;

    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            try {
                attempts++;
                const response = await axios({
                    method: 'get',
                    url: `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
                    headers: { 'X-Api-Key': HEYGEN_API_KEY }
                });

                const status = response.data.data.status;
                console.log(`📊 HeyGen Status: ${status} (${attempts})`);

                if (status === 'completed') {
                    clearInterval(interval);
                    resolve(response.data.data.video_url);
                } else if (status === 'failed') {
                    clearInterval(interval);
                    reject(new Error('HeyGen video generation failed'));
                }

                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    reject(new Error('HeyGen timeout'));
                }
            } catch (error) {
                console.error('Polling HeyGen error:', error.message);
            }
        }, 5000);
    });
}

module.exports = {
    generateLipsyncVideo
};
