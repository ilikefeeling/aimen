const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Connection Info ---');
    try {
        const info = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
        console.log('Current DB/Schema:', info);

        console.log('\n--- All Tables (including schemas) ---');
        const tables = await prisma.$queryRaw`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name
    `;
        console.log(tables);

        console.log('\n--- Checking for User table in any schema ---');
        const userTables = await prisma.$queryRaw`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name ILIKE '%user%'
    `;
        console.log(userTables);

    } catch (err) {
        console.error('Error executing query:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
