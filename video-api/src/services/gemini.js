const axios = require('axios');

/**
 * Analyze video using Gemini AI
 * This is a simplified version adapted from the main aimen project
 * 
 * @param {string} videoUrl - Public URL of the video
 * @param {string} title - Video title
 * @param {object} options - Options including onProgress callback
 * @returns {Promise<object>} Analysis result with highlights
 */
async function analyzeVideoWithGemini(videoUrl, title, options = {}) {
    const { onProgress } = options;

    try {
        onProgress?.(10);

        // Gemini API configuration
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

        onProgress?.(30);

        // Prepare prompt for sermon analysis
        const prompt = `당신은 설교 영상 분석 전문가입니다. 다음 설교 영상을 분석하여 3-5개의 핵심 하이라이트를 추출해주세요.

영상 제목: ${title}

각 하이라이트에 대해 다음 정보를 JSON 형식으로 제공해주세요:
{
  "highlights": [
    {
      "title": "하이라이트 제목",
      "startTime": "시작 시간 (초)",
      "endTime": "종료 시간 (초)",
      "caption": "30-60초 분량의 설명",
      "emotion": "감동적인/은혜로운/도전적인 등",
      "platform": "youtube/instagram/facebook 중 추천"
    }
  ],
  "summary": "전체 설교 요약"
}

핵심 메시지가 명확하고 감동적인 순간을 선택해주세요.`;

        onProgress?.(50);

        const response = await axios.post(apiUrl, {
            contents: [{
                parts: [{
                    text: prompt,
                }],
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        }, {
            timeout: 300000, // 5 minutes timeout
        });

        onProgress?.(80);

        // Parse response
        const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!result) {
            throw new Error('No result from Gemini API');
        }

        // Extract JSON from markdown code block if present
        let jsonResult = result;
        const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            jsonResult = jsonMatch[1];
        }

        const analysisData = JSON.parse(jsonResult);

        onProgress?.(100);

        return {
            highlights: analysisData.highlights || [],
            summary: analysisData.summary || '',
            rawResponse: result,
        };

    } catch (error) {
        console.error('Gemini API error:', error.message);

        if (error.response) {
            console.error('API response error:', error.response.data);
        }

        throw new Error(`AI analysis failed: ${error.message}`);
    }
}

module.exports = {
    analyzeVideoWithGemini,
};
