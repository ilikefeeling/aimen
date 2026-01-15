import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

// Simple test endpoint to verify Prisma connection
export async function GET() {
    try {
        console.log('[TEST] Database connection test starting...');
        console.log('[TEST] DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('[TEST] DATABASE_URL value:', process.env.DATABASE_URL?.substring(0, 30) + '...');

        // Try a simple query
        const count = await prisma.sermon.count();

        console.log('[TEST] Query successful! Sermon count:', count);

        return NextResponse.json({
            success: true,
            message: 'Database connection works!',
            sermonCount: count,
            databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        });
    } catch (error) {
        console.error('[TEST] Database connection failed:', error);
        console.error('[TEST] Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
        });

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        }, { status: 500 });
    }
}
