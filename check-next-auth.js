require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const nextauthUrl = process.env.NEXTAUTH_URL;
const port = process.env.PORT || 3000;

console.log('--- Environment Check ---');
console.log('NEXTAUTH_URL:', nextauthUrl);
console.log('PORT (env):', port);

if (nextauthUrl && !nextauthUrl.includes(':3001') && nextauthUrl.includes(':3000')) {
    console.warn('\n⚠️ WARNING: Your NEXTAUTH_URL is set to 3000, but your app might be running on 3001.');
    console.warn('This causes session cookies to fail, leading to a loop or redirect back to login.');
}

console.log('-------------------------');
