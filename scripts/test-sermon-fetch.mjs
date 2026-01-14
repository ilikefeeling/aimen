import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testFetch() {
    try {
        const sermon = await prisma.sermon.findFirst({
            include: {
                highlights: true
            }
        });
        console.log('✅ Fetch successful:', sermon ? sermon.id : 'No sermon found');
        if (sermon) {
            console.log('Analysis Data:', JSON.stringify(sermon.analysisData, null, 2));
            console.log('Highlights count:', sermon.highlights.length);
        }
    } catch (error) {
        console.error('❌ Fetch failed:', error.message);
        if (error.message.includes('updatedAt')) {
            console.log('⚠️ Confirmed: updatedAt column is missing in DB');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testFetch();
