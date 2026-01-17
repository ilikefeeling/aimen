import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || 'test_sk_Z61GzykEn7X2w6zN49Q7VPaYp9RX'; // 토스페이먼츠 테스트 시크릿 키

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { paymentKey, orderId, amount } = body;

        // 1. 토스페이먼츠 승인 API 호출
        // Authorization 헤더는 SecretKey + ":" 를 Base64 인코딩한 값
        const basicAuth = Buffer.from(TOSS_SECRET_KEY + ':').toString('base64');

        const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentKey,
                orderId,
                amount,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Toss verification failed:', data);
            return NextResponse.json({
                error: 'Payment verification failed',
                details: data
            }, { status: response.status });
        }

        // 2. DB 업데이트: 사용자 플랜 PRO로 전환 & 결제 내역 기록
        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: { plan: 'PRO' }
            }),
            prisma.payment.create({
                data: {
                    userId: session.user.id,
                    paymentKey: data.paymentKey,
                    amount: data.totalAmount,
                    status: 'COMPLETED',
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            message: 'Plan upgraded to PRO successfully'
        });

    } catch (error) {
        console.error('Payment confirmation error:', error);
        return NextResponse.json({
            error: 'Internal server error during confirmation'
        }, { status: 500 });
    }
}
