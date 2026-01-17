'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 클라이언트 키는 환경 변수에서 가져오거나 테스트용 키를 기본값으로 사용합니다.
const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D53Qvx7487Pl0Z6Y6kv34W96Lz8P';

export default function UpgradePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [sdkError, setSdkError] = useState<string | null>(null);

    // 인증 체크
    if (status === 'unauthenticated') {
        router.push('/login?callbackUrl=/dashboard/upgrade');
        return null;
    }

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-[60vh] text-white font-bold">인증 정보 확인 중...</div>;
    }

    const handlePayment = async () => {
        if (!session?.user) {
            router.push('/login');
            return;
        }

        try {
            setLoading(true);
            setSdkError(null);

            // 키 형식 유효성 체크
            if (!CLIENT_KEY.startsWith('test_') && !CLIENT_KEY.startsWith('live_')) {
                throw new Error("올바른 토스페이먼츠 클라이언트 키(test_ck... 또는 live_ck...)를 설정해 주세요.");
            }

            const tossPayments = await loadTossPayments(CLIENT_KEY);

            if (!tossPayments) {
                throw new Error("토스페이먼츠 SDK를 불러오지 못했습니다.");
            }

            // 주문 ID 생성 (고유값)
            const orderId = `ORDER_${Date.now()}_${session.user.id.slice(-6)}`;

            await tossPayments.requestPayment('카드', {
                amount: 99000,
                orderId,
                orderName: '에이아이멘 Prophet Plan (월 구독)',
                customerName: session.user.name || '성도님',
                successUrl: `${window.location.origin}/dashboard/upgrade/success`,
                failUrl: `${window.location.origin}/dashboard/upgrade/fail`,
            });
        } catch (err: any) {
            console.error('Payment request failed:', err);
            setSdkError(err.message || '결제 준비 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    const features = [
        "무제한 설교 영상 분석 활성화",
        "AI 음성 복제(Voice Cloning) 지원",
        "다국어 립싱크(HeyGen) 보정",
        "4K 초고화질 무변형 클립 추출",
        "프리미엄 폰트 및 커스텀 디자인",
        "전용 워커 할당 (최우선 처리)",
        "1:1 기술 지원 및 사역 컨설팅"
    ];

    return (
        <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-12 animate-fade-in relative">
            <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-black uppercase tracking-widest border border-gold/20">
                    <Crown className="w-4 h-4" /> Premium Upgrade
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                    사역의 지경을 <br />
                    <span className="text-gold-gradient italic">열방으로 넓히십시오.</span>
                </h1>
                {sdkError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl max-w-2xl mx-auto animate-shake space-y-2">
                        <p className="font-black text-lg">⚠️ 결제 시스템 오류</p>
                        <p className="font-bold">{sdkError}</p>
                        <div className="text-xs mt-4 p-3 bg-black/20 rounded-lg text-left">
                            <p className="font-bold mb-1 text-gold">💡 해결 방법:</p>
                            <ul className="list-disc list-inside space-y-1 opacity-80">
                                <li>Toss Payments 개발자 센터에서 키가 활성 상태인지 확인하세요.</li>
                                <li>.env.local 파일에 <code>NEXT_PUBLIC_TOSS_CLIENT_KEY</code>가 올바른지 확인하세요.</li>
                                <li>테스트 도메인(localhost:3000)이 등록되어 있는지 확인하세요.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <Card className="glass-panel-heavy p-8 md:p-16 rounded-[3rem] border-gold/30 bg-gold/5 shadow-divine relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Sparkles className="w-64 h-64 text-gold transform rotate-12" />
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Prophet Plan</h2>
                            <p className="text-gold font-bold">에이아이멘의 모든 도구를 사용하는 권능</p>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-white">₩99,000</span>
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">/ Month</span>
                        </div>

                        <ul className="space-y-4">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                                    <Check className="w-5 h-5 text-gold shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-navy-darker/50 p-8 rounded-3xl border border-white/5 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                    <Shield className="w-6 h-6 text-gold" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">안전한 결제</h4>
                                    <p className="text-xs text-gray-500">Toss Payments 보안 시스템 적용</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                    <Zap className="w-6 h-6 text-gold" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">즉시 활성화</h4>
                                    <p className="text-xs text-gray-500">결제 완료 즉시 모든 기능 개방</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] py-6 rounded-2xl font-black text-2xl shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '연결 중...' : '지금 업그레드하기'}
                        </button>
                        <p className="text-center text-xs text-gray-500 font-bold tracking-widest uppercase">
                            ✓ 부가세 포함 · 주일의 은혜를 평일의 일상으로
                        </p>
                    </div>
                </div>
            </Card>
        </div >
    );
}
