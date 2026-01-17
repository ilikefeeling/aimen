'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Loader2, CheckCircle2, PartyPopper, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const confirmPayment = async () => {
            const paymentKey = searchParams.get('paymentKey');
            const orderId = searchParams.get('orderId');
            const amount = searchParams.get('amount');

            if (!paymentKey || !orderId || !amount) {
                setStatus('error');
                setErrorMsg('결제 정보가 부족합니다.');
                return;
            }

            try {
                const response = await fetch('/api/payments/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
                });

                if (response.ok) {
                    setStatus('success');
                } else {
                    const data = await response.json();
                    setStatus('error');
                    setErrorMsg(data.error || '결제 승인 중 오류가 발생했습니다.');
                }
            } catch (err) {
                console.error('Confirmation error:', err);
                setStatus('error');
                setErrorMsg('서버와 통신 중 오류가 발생했습니다.');
            }
        };

        confirmPayment();
    }, [searchParams]);

    if (status === 'verifying') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-16 h-16 text-gold animate-spin" />
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-white italic">결제 승인 확인 중</h2>
                    <p className="text-gray-500">결제 정보를 안전하게 확인하고 플랜을 활성화하고 있습니다...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-12 text-center bg-red-500/5 border-red-500/20 rounded-[3rem] space-y-8">
                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto">
                        <Loader2 className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-white tracking-widest uppercase">Verification Failed</h2>
                        <p className="text-gray-400 font-medium leading-relaxed">{errorMsg}</p>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard/upgrade')}
                        className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl font-black border-none"
                    >
                        다시 시도하기
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

            <Card className="max-w-2xl w-full p-12 md:p-20 text-center bg-gold/5 border-gold/30 rounded-[4rem] space-y-12 shadow-divine relative z-10 animate-fade-in">
                <div className="relative">
                    <div className="w-32 h-32 bg-gradient-gold rounded-[2.5rem] flex items-center justify-center mx-auto shadow-gold rotate-12 relative z-10">
                        <CheckCircle2 className="w-16 h-16 text-navy" />
                    </div>
                    <PartyPopper className="absolute -top-4 -right-4 w-12 h-12 text-gold animate-bounce-slow" />
                </div>

                <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                        할렐루야! <br />
                        <span className="text-gold-gradient italic">Prophet Plan이 활성화되었습니다.</span>
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed max-w-md mx-auto">
                        이제 모든 프리미엄 기능을 사용하여<br />
                        주님의 귀한 말씀을 세상 끝까지 전할 수 있습니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <Button
                        onClick={() => router.push('/dashboard/upload')}
                        className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] py-6 rounded-2xl font-black text-lg shadow-gold border-none flex items-center justify-center gap-3"
                    >
                        첫 선교 영상 분석 <ArrowRight className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="glass-panel text-white py-6 rounded-2xl font-bold text-lg border-white/10"
                    >
                        대시보드로 가기
                    </Button>
                </div>

                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">
                    사역의 영광을 주님께 · AI-men과 함께해주셔서 감사합니다
                </p>
            </Card>
        </div>
    );
}
