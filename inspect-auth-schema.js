const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const tables = ['User', 'Account', 'Session'];
        for (const table of tables) {
            const columns = await prisma.$queryRawUnsafe(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}'`);
            console.log(`\nColumns in ${table} table:`);
            console.log(JSON.stringify(columns, null, 2));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
