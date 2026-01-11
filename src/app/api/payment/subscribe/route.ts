import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { plan, merchantUid } = body;

        if (!plan || !merchantUid) {
            return NextResponse.json(
                { error: 'Plan and merchant UID are required' },
                { status: 400 }
            );
        }

        // Validate plan
        if (plan !== 'pro' && plan !== 'free') {
            return NextResponse.json(
                { error: 'Invalid subscription plan' },
                { status: 400 }
            );
        }

        // Get plan pricing
        const planPrices: Record<string, number> = {
            free: 0,
            pro: 29000, // 29,000 KRW per month
        };

        const amount = planPrices[plan];

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId: session.user.id,
                amount,
                status: 'pending',
                subscriptionPlan: plan,
                subscriptionPeriod: 'monthly',
                merchantUid,
            },
        });

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            amount: payment.amount,
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        return NextResponse.json(
            { error: 'Failed to create payment' },
            { status: 500 }
        );
    }
}
