const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
}

/**
 * Retry wrapper with exponential backoff
 * Handles 503 (overload) and 429 (quota) errors
 */
async function retryWithBackoff(fn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const errorMsg = error.message || '';
            const isOverloaded = errorMsg.includes('overloaded');
            const is503 = errorMsg.includes('503');
            const is429 = errorMsg.includes('429');
            const quotaExceeded = errorMsg.includes('quota');

            if ((isOverloaded || is503 || is429 || quotaExceeded) && attempt < maxRetries) {
                let delay = 25000; // Default 25 seconds for quota errors

                // Extract retry delay from error message if available
                const retryMatch = errorMsg.match(/retry in ([\d.]+)s/i);
                if (retryMatch) {
                    delay = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000; // Add 1s buffer
                } else if (!is429 && !quotaExceeded) {
                    // For 503 errors, use exponential backoff
                    delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                }

                const errorType = is429 || quotaExceeded ? 'quota exceeded' : 'overloaded';
                console.log(`⚠️  Gemini API ${errorType}, retrying in ${delay / 1000}s (attempt ${attempt}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

/**
 * Analyze video with Gemini 2.5 Flash
 */
async function analyzeVideoWithGemini(videoUrl, title, options = {}) {
    const { onProgress } = options;

    console.log('🎥 Starting video analysis...');
    console.log('   Video URL:', videoUrl);
    console.log('   Title:', title);

    try {
        onProgress?.(10);

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        onProgress?.(20);

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
2. 구간 길이: 각 30초~90초 사이 (가장 은혜로운 대목 위주)
3. 시간 단위: startTime과 endTime은 반드시 '초(seconds)' 단위의 숫자여야 함
4. 언어: 모든 텍스트는 한국어로 작성`;

        onProgress?.(30);

        console.log('🤖 Calling Gemini 2.5 Flash API...');

        // Use retry wrapper for API call
        const analysisData = await retryWithBackoff(async () => {
            const result = await model.generateContent(prompt);
            const response = result.response;
            const responseText = response.text();

            console.log('📝 Gemini 2.5 Flash JSON response received');

            try {
                const parsedData = JSON.parse(responseText);

                if (!parsedData.highlights || !Array.isArray(parsedData.highlights)) {
                    throw new Error('Invalid response: highlights array missing');
                }

                return parsedData;
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.debug('Raw response:', responseText);
                throw new Error('Failed to parse Gemini JSON response');
            }
        });

        onProgress?.(80);

        console.log(`✅ Analysis complete: ${analysisData.highlights.length} highlights generated`);

        onProgress?.(100);

        return analysisData;

    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
        throw error;
    }
}

module.exports = {
    analyzeVideoWithGemini
};
