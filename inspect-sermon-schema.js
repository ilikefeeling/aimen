const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const columns = await prisma.$queryRaw`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Sermon'`;
        console.log('Columns in Sermon table:');
        console.log(JSON.stringify(columns, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
