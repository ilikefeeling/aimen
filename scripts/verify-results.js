const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    try {
        console.log('🔍 Fetching latest sermon data...');
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
            console.log('❓ No sermon found.');
            return;
        }

        console.log(`🎬 Sermon: ${sermon.title} (ID: ${sermon.id})`);
        console.log(`   Status: ${sermon.status}`);
        console.log(`   Analysis: ${JSON.stringify(sermon.analysisData)}`);

        console.log('\n✨ Highlights:');
        if (sermon.highlights.length === 0) {
            console.log('   (No highlights extracted)');
        }

        sermon.highlights.forEach((h, i) => {
            console.log(`${i + 1}. ${h.title}`);
            console.log(`   - Caption: ${h.caption}`);
            console.log(`   - Time: ${h.startTime}s ~ ${h.endTime}s`);
            console.log(`   - Clips: ${h.clips.length}`);

            h.clips.forEach(c => {
                console.log(`     [${c.platform}] Status: ${c.status}, URL: ${c.videoUrl || 'N/A'}`);
            });
        });

    } catch (err) {
        console.error('❌ Error during verification:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
