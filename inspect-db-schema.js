const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('Tables in public schema:');
        console.log(JSON.stringify(result, null, 2));

        const columns = await prisma.$queryRaw`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Highlight'`;
        console.log('\nColumns in Highlight table:');
        console.log(JSON.stringify(columns, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
