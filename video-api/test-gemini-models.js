const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
    const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDNPF4c2w01UWQ91WHGUQ-KwrcrbXGzjBo';

    console.log('🔍 Testing Gemini API Key...');
    console.log('API Key:', API_KEY.substring(0, 20) + '...');

    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
        // Try to list models
        console.log('\n📋 Attempting to list available models...\n');

        // Try gemini-pro
        console.log('Testing gemini-pro...');
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Say 'Hello'");
            const response = await result.response;
            console.log('✅ gemini-pro: WORKS');
            console.log('   Response:', response.text().substring(0, 50));
        } catch (err) {
            console.log('❌ gemini-pro: FAILED');
            console.log('   Error:', err.message);
        }

        // Try gemini-1.5-flash
        console.log('\nTesting gemini-1.5-flash...');
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Say 'Hello'");
            const response = await result.response;
            console.log('✅ gemini-1.5-flash: WORKS');
            console.log('   Response:', response.text().substring(0, 50));
        } catch (err) {
            console.log('❌ gemini-1.5-flash: FAILED');
            console.log('   Error:', err.message);
        }

        // Try gemini-1.5-pro
        console.log('\nTesting gemini-1.5-pro...');
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContent("Say 'Hello'");
            const response = await result.response;
            console.log('✅ gemini-1.5-pro: WORKS');
            console.log('   Response:', response.text().substring(0, 50));
        } catch (err) {
            console.log('❌ gemini-1.5-pro: FAILED');
            console.log('   Error:', err.message);
        }

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
    }
}

listAvailableModels();
