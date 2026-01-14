const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const sermons = await prisma.sermon.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                highlights: true
            }
        });
        console.log(JSON.stringify(sermons, null, 2));
    } catch (err) {
        console.error('Error listing sermons:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
