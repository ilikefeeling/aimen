import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { merchantUid, impUid, status, amount } = body;

        if (!merchantUid) {
            return NextResponse.json(
                { error: 'Merchant UID is required' },
                { status: 400 }
            );
        }

        // Find payment record
        const payment = await prisma.payment.findUnique({
            where: { merchantUid },
            include: { user: true },
        });

        if (!payment) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Update payment status
        await prisma.payment.update({
            where: { merchantUid },
            data: {
                status: status === 'paid' ? 'completed' : 'failed',
                impUid: impUid || undefined,
            },
        });

        // If payment is successful, update user subscription
        if (status === 'paid') {
            const subscriptionEndsAt = new Date();
            subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1); // Add 1 month

            await prisma.user.update({
                where: { id: payment.userId },
                data: {
                    subscriptionStatus: payment.subscriptionPlan,
                    subscriptionEndsAt,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Webhook processed successfully',
        });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook' },
            { status: 500 }
        );
    }
}
