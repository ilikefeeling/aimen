const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('📡 Attempting to connect to database...');
        const result = await prisma.$queryRaw`SELECT current_database(), current_schema(), now()`;
        console.log('✅ Connection Successful!');
        console.log('📊 Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        if (err.code) console.error('   Error Code:', err.code);
    } finally {
        await prisma.$disconnect();
    }
}

check();
