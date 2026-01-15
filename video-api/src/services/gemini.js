const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager, FileState } = require('@google/generative-ai/server');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
}

// Initialize File Manager
const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

/**
 * Retry wrapper with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const errorMsg = error.message || '';
            const isOverloaded = errorMsg.includes('overloaded') || errorMsg.includes('503');
            const isQuota = errorMsg.includes('429') || errorMsg.includes('quota');

            if ((isOverloaded || isQuota) && attempt < maxRetries) {
                let delay = isQuota ? 30000 : Math.min(1000 * Math.pow(2, attempt - 1), 10000);

                const retryMatch = errorMsg.match(/retry in ([\d.]+)s/i);
                if (retryMatch) delay = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000;

                console.log(`⚠️ Gemini API retry in ${delay / 1000}s (attempt ${attempt}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

/**
 * Analyze video with Gemini 1.5 Flash using File API for stability
 */
async function analyzeVideoWithGemini(videoUrl, title, options = {}) {
    const { onProgress } = options;
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempFilePath = path.join(tempDir, `gemini-upload-${Date.now()}.mp4`);
    let fileMeta;

    try {
        onProgress?.(5);
        console.log('🎥 Downloading video for Gemini upload...');

        // 1. Download to local temp for File API upload
        const response = await axios({
            method: 'get',
            url: videoUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        onProgress?.(15);
        console.log('⬆️ Uploading to Gemini File API...');

        // 2. Upload using File API
        const uploadResponse = await fileManager.uploadFile(tempFilePath, {
            mimeType: 'video/mp4',
            displayName: title,
        });
        fileMeta = uploadResponse.file;
        console.log(`📄 File uploaded: ${fileMeta.name}`);

        onProgress?.(25);

        // 3. Poll for file status (ACTIVE)
        console.log('⏳ Waiting for video processing...');
        let file = await fileManager.getFile(fileMeta.name);
        let pollCount = 0;
        const maxPolls = 60; // 5 minutes (5s * 60)

        while (file.state === FileState.PROCESSING) {
            if (pollCount >= maxPolls) {
                throw new Error('Timeout: Video processing took too long at Gemini');
            }
            process.stdout.write('.');
            await new Promise((resolve) => setTimeout(resolve, 5000));
            file = await fileManager.getFile(fileMeta.name);
            pollCount++;
            onProgress?.(Math.min(25 + pollCount, 70));
        }

        if (file.state === FileState.FAILED) {
            throw new Error('Gemini File API: Video processing failed');
        }

        console.log('\n✅ Video is ACTIVE. Starting analysis...');
        onProgress?.(75);

        // 4. Generate content
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `당신은 설교 영상 분석 및 숏폼 컨텐츠 제작 전문가입니다. 
다음 설교 영상을 분석하여 3-5개의 핵심 하이라이트를 추출하고 전체 내용을 요약해주세요.

영상 제목: "${title}"

반드시 다음 JSON 구조를 정확히 지켜주세요:
{
  "highlights": [
    {
      "title": "시청자의 관심을 끌 수 있는 강렬한 제목",
      "startTime": 120, 
      "endTime": 180,
      "caption": "영상 하단에 표시될 자막용 텍스트 (60자 내외)",
      "emotion": "감동적인 | 은혜로운 | 도전적인 | 위로가 되는 | 유머러스한",
      "platform": "youtube_shorts | instagram_reels | tiktok"
    }
  ],
  "summary": "전체 설교의 핵심 메시지를 요약 (3문장 이내)"
}

**제약 사항:**
1. 하이라이트 개수: 3~5개
2. 구간 길이: 각 30초~90초 사이
3. 시간 단위: startTime과 endTime은 반드시 '초(seconds)' 단위의 숫자
4. 언어: 모든 텍스트는 한국어
5. 답변은 반드시 유효한 JSON 객체여야 하며, 다른 설명이나 인사말을 포함하지 마세요.`;

        const parsedData = await retryWithBackoff(async () => {
            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType: file.mimeType,
                        fileUri: file.uri
                    }
                },
                { text: prompt },
            ]);
            const responseText = result.response.text();
            console.log('📝 Gemini 2.5 Flash response received');

            let parsedData;
            try {
                // Try direct parse
                parsedData = JSON.parse(responseText);
            } catch (e) {
                console.warn('⚠️  Standard JSON parse failed, trying extraction...');
                // Fallback: Use regex to extract JSON block if preamble exists
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsedData = JSON.parse(jsonMatch[0]);
                    } catch (e2) {
                        console.error('❌ JSON extraction failed:', e2.message);
                        console.debug('Raw text was:', responseText);
                        throw new Error('Failed to parse Gemini JSON response (Extraction Error)');
                    }
                } else {
                    console.error('❌ No JSON block found in response');
                    console.debug('Raw text was:', responseText);
                    throw new Error('Failed to parse Gemini JSON response (No JSON found)');
                }
            }

            if (!parsedData.highlights || !Array.isArray(parsedData.highlights)) {
                throw new Error('Invalid response: highlights array missing');
            }

            return parsedData;
        });

        onProgress?.(100);
        console.log(`✅ Analysis complete: ${parsedData.highlights.length} highlights`);

        return parsedData;

    } catch (error) {
        console.error('❌ Gemini Error:', error.message);
        throw error;
    } finally {
        // Cleanup temp file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

module.exports = {
    analyzeVideoWithGemini
};
