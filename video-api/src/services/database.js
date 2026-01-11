// Use Prisma Client from PARENT project (aimen/)
const path = require('path');
const parentProjectPath = path.resolve(__dirname, '../../..');

console.log('Loading Prisma from parent project:', parentProjectPath);

// Import PrismaClient from parent's node_modules
const { PrismaClient } = require(path.join(parentProjectPath, 'node_modules/@prisma/client'));

console.log('PrismaClient loaded');

const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

console.log('✅ Prisma initialized');
console.log('   - prisma:', prisma ? 'OK' : 'FAIL');
console.log('   - prisma.video:', prisma.video ? 'OK' : 'FAIL');

// Graceful shutdown
process.on('beforeExit', async () => {
    if (prisma && prisma.$disconnect) {
        await prisma.$disconnect();
    }
});

module.exports = { prisma };
