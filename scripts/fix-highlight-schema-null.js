const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('⏳ Altering Highlight table to make videoUrl nullable...');
        await prisma.$executeRawUnsafe('ALTER TABLE "Highlight" ALTER COLUMN "videoUrl" DROP NOT NULL');
        console.log('✅ Alter table success!');
    } catch (err) {
        console.error('❌ Alter table failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
