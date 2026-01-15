const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Validates the Gemini API key by performing a minimal content generation request.
 * @returns {Promise<{valid: boolean, message: string}>}
 */
async function checkGeminiAuth() {
    const api_key = process.env.GEMINI_API_KEY;

    if (!api_key) {
        return { valid: false, message: 'GEMINI_API_KEY is missing from environment variables' };
    }

    const testModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
    let lastError = null;

    for (const modelName of testModels) {
        try {
            const genAI = new GoogleGenerativeAI(api_key);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent("Hi");
            const response = await result.response;
            const text = response.text();

            console.log(`✅ Gemini API Key is Valid (using ${modelName}).`);
            return { valid: true, message: `API Key is valid (verified with ${modelName})`, model: modelName };
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ Model ${modelName} test failed: ${error.message}`);
            // If it's a 401/403 (invalid/expired), no point trying other models
            if (error.message.includes('API key expired') || error.message.includes('API_KEY_INVALID')) {
                break;
            }
        }
    }

    console.error(`❌ Gemini API Key Verification Failed: ${lastError.message}`);
    return {
        valid: false,
        message: lastError.message,
        apiKeyPreview: api_key.substring(0, 6) + '...' + api_key.substring(api_key.length - 4)
    };
}

module.exports = { checkGeminiAuth };
