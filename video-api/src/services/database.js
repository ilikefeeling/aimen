// Load video-api .env file FIRST
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const path = require('path');
const parentProjectPath = path.resolve(__dirname, '../../..');

console.log('🔍 Database Configuration:');
console.log('   - DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

// Import PrismaClient from parent's node_modules
const { PrismaClient } = require(path.join(parentProjectPath, 'node_modules/@prisma/client'));

console.log('✅ PrismaClient loaded from parent project');

// Create Prisma instance with EXPLICIT datasource URL from video-api .env
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    log: ['error', 'warn'],
});

console.log('✅ Prisma initialized');
console.log('   - Connected to:', process.env.DATABASE_URL?.includes('supabase') ? 'Supabase' : 'Unknown');

// Graceful shutdown
process.on('beforeExit', async () => {
    if (prisma && prisma.$disconnect) {
        await prisma.$disconnect();
    }
});

module.exports = { prisma };
