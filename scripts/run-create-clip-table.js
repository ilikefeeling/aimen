const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const sqlPath = path.join(__dirname, '../scripts/create-clip-table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('⏳ Creating Clip table...');

        // Split SQL into individual commands
        const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);

        for (const cmd of commands) {
            console.log(`  Executing: ${cmd.substring(0, 50).replace(/\n/g, ' ')}...`);
            await prisma.$executeRawUnsafe(cmd);
        }

        console.log('✅ Clip table and related indexes created successfully!');
    } catch (err) {
        console.error('❌ Failed to create Clip table:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
