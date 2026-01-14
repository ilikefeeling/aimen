import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkColumns() {
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Highlight';
        `;
        console.log('📊 Highlight Columns in DB:', columns);

        const sermonColumns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Sermon';
        `;
        console.log('📊 Sermon Columns in DB:', sermonColumns);
    } catch (error) {
        console.error('❌ Query failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkColumns();
