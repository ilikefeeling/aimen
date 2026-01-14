import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixSchema() {
    try {
        console.log('🛠 Starting DB schema repair...');

        // 1. Add missing columns to Highlight table
        console.log('  - Adding missing columns to Highlight...');
        await prisma.$executeRaw`ALTER TABLE "Highlight" ADD COLUMN IF NOT EXISTS "title" TEXT DEFAULT 'Untitled'`;
        await prisma.$executeRaw`ALTER TABLE "Highlight" ADD COLUMN IF NOT EXISTS "emotion" TEXT`;
        await prisma.$executeRaw`ALTER TABLE "Highlight" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()`;

        // 2. Fix startTime and endTime types (if they are text)
        console.log('  - Converting startTime/endTime from TEXT to INTEGER...');
        // Note: Using USING clause for type conversion
        await prisma.$executeRaw`ALTER TABLE "Highlight" ALTER COLUMN "startTime" TYPE INTEGER USING "startTime"::INTEGER`;
        await prisma.$executeRaw`ALTER TABLE "Highlight" ALTER COLUMN "endTime" TYPE INTEGER USING "endTime"::INTEGER`;

        // 3. Add missing columns to Sermon table
        console.log('  - Adding missing columns to Sermon...');
        await prisma.$executeRaw`ALTER TABLE "Sermon" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()`;

        console.log('✅ DB Schema repair complete!');
    } catch (error) {
        console.error('❌ Schema repair failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixSchema();
