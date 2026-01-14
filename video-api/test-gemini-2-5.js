const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini25() {
    const API_KEY = 'AIzaSyD22_Dn7wv2KRP0g6GPSYVQfSLrPt5fMNU';

    console.log('🔍 Testing Gemini 2.5 Flash...\n');

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const result = await model.generateContent("Say 'Hello' in Korean");
        const response = await result.response;
        console.log('✅ SUCCESS!');
        console.log('Response:', response.text());
    } catch (err) {
        console.log('❌ FAILED');
        console.log('Error:', err.message);
    }
}

testGemini25();
