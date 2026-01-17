const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Voice Map for different tones
const VOICE_MAP = {
    'professional': 'pNInz6obpg8nEByWQX2t', // Professional/Neutral
    'calm': 'EXAVITQu4vr4xnSDxMaL',        // Soft/Calm (Bella)
    'energetic': '21m00Tcm4TlvDq8ikWAM',   // Energetic/High Energy (Rachel)
};

/**
 * AI Multilingual Dubbing Service using ElevenLabs
 */
async function generateDubbedAudio(text, options = {}) {
    const {
        targetLanguage = 'english',
        tone = 'professional',
        voiceId: customVoiceId,
        onProgress
    } = options;

    const voiceId = customVoiceId || VOICE_MAP[tone] || VOICE_MAP['professional'];
    const stability = tone === 'energetic' ? 0.6 : 0.75;
    const similarityBoost = 0.85;

    if (!ELEVENLABS_API_KEY) {
        console.warn('⚠️ ELEVENLABS_API_KEY is missing. Dubbing might fail.');
    }

    try {
        console.log(`🎙️ Generating dubbing for language: ${targetLanguage}`);

        // ElevenLabs Text-to-Speech API call
        const response = await axios({
            method: 'post',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            data: {
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: stability,
                    similarity_boost: similarityBoost,
                    style: 0.5,
                    use_speaker_boost: true
                }
            },
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer'
        });

        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const audioFilePath = path.join(tempDir, `dub-${Date.now()}.mp3`);
        fs.writeFileSync(audioFilePath, Buffer.from(response.data));

        console.log(`✅ Dubbing generated: ${audioFilePath}`);
        return audioFilePath;

    } catch (error) {
        console.error('❌ ElevenLabs Error:', error.response?.data?.toString() || error.message);
        throw new Error(`ElevenLabs TTS failed: ${error.message}`);
    }
}

/**
 * Generate dubbed version of a video clip
 * Currently simple version that replaces audio
 */
async function dubVideoClip(videoPath, dubbedAudioPath, outputPath) {
    const ffmpeg = require('fluent-ffmpeg');

    return new Promise((resolve, reject) => {
        console.log('🎬 Mixing dubbed audio with video...');

        ffmpeg(videoPath)
            .input(dubbedAudioPath)
            .outputOptions([
                '-map 0:v:0', // Use video from first input
                '-map 1:a:0', // Use audio from second input
                '-shortest',   // Match shortest stream length
                '-c:v copy',   // Don't re-encode video
                '-c:a aac',    // Encode audio to AAC
                '-b:a 192k'
            ])
            .output(outputPath)
            .on('end', () => {
                console.log('✅ Dubbed video created successfully');
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('❌ FFmpeg Dubbing Error:', err.message);
                reject(err);
            })
            .run();
    });
}

/**
 * Create 'Voice Clone' of a user (Instant Voice Cloning)
 * Requires existing audio sample of the user
 */
async function createVoiceClone(audioSamplePath, name) {
    const FormData = require('form-data');
    const form = new FormData();

    form.append('name', name);
    form.append('files', fs.createReadStream(audioSamplePath));
    form.append('description', `Cloned voice for sermon analysis: ${name}`);

    try {
        console.log(`🎙️ Cloning voice for: ${name}...`);
        const response = await axios({
            method: 'post',
            url: 'https://api.elevenlabs.io/v1/voices/add',
            data: form,
            headers: {
                ...form.getHeaders(),
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });

        const voiceId = response.data.voice_id;
        console.log(`✅ Voice cloned successfully. Voice ID: ${voiceId}`);
        return voiceId;
    } catch (error) {
        console.error('❌ ElevenLabs Voice Cloning Error:', error.response?.data || error.message);
        // Fallback to professional if cloning fails
        return VOICE_MAP['professional'];
    }
}

module.exports = {
    generateDubbedAudio,
    dubVideoClip,
    createVoiceClone
};
