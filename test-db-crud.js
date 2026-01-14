const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Starting DB CRUD Test...\n');

    try {
        // 1. Create or Find Test User
        console.log('👤 Handling Test User...');
        const user = await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: { name: 'Test User (Updated)' },
            create: {
                email: 'test@example.com',
                name: 'Test User',
                status: 'ACTIVE',
                role: 'USER'
            }
        });
        console.log('✅ User:', user.id, user.name);

        // 2. Create Test Sermon
        console.log('\n📹 Creating Test Sermon...');
        const sermon = await prisma.sermon.create({
            data: {
                title: 'Test Sermon ' + new Date().toISOString(),
                videoUrl: 'https://example.com/test-video.mp4',
                userId: user.id,
                analysisData: {
                    status: 'PENDING',
                    notes: 'This is a test record'
                }
            }
        });
        console.log('✅ Sermon Created:', sermon.id, sermon.title);

        // 3. Read back
        console.log('\n🔍 Reading back Sermon...');
        const foundSermon = await prisma.sermon.findUnique({
            where: { id: sermon.id },
            include: { user: true }
        });
        console.log('✅ Found Sermon with User:', foundSermon.title, 'by', foundSermon.user.name);

        // 4. Update
        console.log('\n📝 Updating Sermon title...');
        const updatedSermon = await prisma.sermon.update({
            where: { id: sermon.id },
            data: { title: sermon.title + ' (Updated)' }
        });
        console.log('✅ Updated Title:', updatedSermon.title);

        console.log('\n🎉 ALL CRUD TESTS PASSED!');

    } catch (err) {
        console.error('❌ CRUD TEST FAILED');
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
