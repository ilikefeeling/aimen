import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking Sermon and Highlights...');

    // Find the latest sermon
    const sermon = await prisma.sermon.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
            highlights: {
                include: {
                    clips: true
                }
            }
        }
    });

    if (!sermon) {
        console.log('❌ No sermons found.');
        return;
    }

    console.log(`🎬 Latest Sermon: "${sermon.title}" (ID: ${sermon.id})`);
    console.log(`📊 Analysis Status: ${JSON.stringify(sermon.analysisData)}`);
    console.log(`✨ Highlights Count: ${sermon.highlights.length}`);

    sermon.highlights.forEach((h, i) => {
        console.log(`   [${i + 1}] ${h.title} (${h.startTime}s - ${h.endTime}s)`);
        console.log(`       Clips: ${h.clips.length}`);
        h.clips.forEach(c => {
            console.log(`          - ${c.platform}: ${c.videoUrl}`);
        });
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
