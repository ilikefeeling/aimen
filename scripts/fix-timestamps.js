const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const latestSermon = await prisma.sermon.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { highlights: true }
        });

        if (!latestSermon) return;

        console.log(`Updating timestamps for: ${latestSermon.title}`);

        let start = 5;
        for (const h of latestSermon.highlights) {
            await prisma.highlight.update({
                where: { id: h.id },
                data: {
                    startTime: start,
                    endTime: start + 15 // 15 second clips
                }
            });
            console.log(`Updated ${h.title}: ${start}s - ${start + 15}s`);
            start += 15;
        }

        // Also clear previous clips for a clean run
        await prisma.clip.deleteMany({
            where: { highlightId: { in: latestSermon.highlights.map(h => h.id) } }
        });
        console.log('Cleared existing clips.');

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
