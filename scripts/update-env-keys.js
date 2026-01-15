const fs = require('fs');
const path = require('path');

const key = process.argv[2] || 'AIzaSyAjooDMxjHP3BaZ-BwblJZDJ4iqCzpQgvs';
const files = ['.env', '.env.local', 'video-api/.env'];

files.forEach(file => {
    const fullPath = path.resolve(file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('GEMINI_API_KEY=')) {
            content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${key}`);
        } else {
            content += `\nGEMINI_API_KEY=${key}\n`;
        }
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Updated ${file}`);
    } else {
        console.log(`❓ ${file} not found, creating new one...`);
        fs.writeFileSync(fullPath, `GEMINI_API_KEY=${key}\n`);
    }
});
