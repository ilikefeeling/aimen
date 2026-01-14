'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    CheckCircle2,
    Sparkles,
    ArrowRight,
    Video,
    Zap,
    Scissors,
    Music
} from 'lucide-react';

export default function LoginSuccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-navy-darker flex items-center justify-center p-4">
            <div className="max-w-xl w-full text-center">
                {/* Success Animation Area */}
                <div className="mb-10 flex justify-center relative">
                    <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full scale-50 animate-pulse" />
                    <div className="relative">
                        <div className="w-40 h-40 bg-navy-light rounded-2xl flex items-center justify-center shadow-card-deep border border-gold/30 animate-float">
                            <CheckCircle2 className="w-24 h-24 text-gold" />
                        </div>
                        {/* Particle effects */}
                        <div className="absolute -top-4 -right-4 bg-gold/10 p-2 rounded-lg border border-gold/20 animate-bounce-slow">
                            <Sparkles className="w-6 h-6 text-gold" />
                        </div>
                    </div>
                </div>

                {/* Welcome Message */}
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                    로그인 <span className="text-gold italic">성공!</span>
                </h1>
                <p className="text-xl text-gray-400 mb-10 leading-relaxed font-medium">
                    에이아이멘 사역의 가족이 되신 것을 환영합니다.<br />
                    이제 주님의 말씀을 세상에 널리 알릴 준비가 되었습니다.
                </p>

                {/* Feature Previews */}
                <div className="grid grid-cols-1 gap-4 mb-12">
                    <div className="flex items-center gap-4 text-left p-4 bg-navy-light/40 border border-gold/10 rounded-2xl hover:bg-navy-light/60 transition-colors group">
                        <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">초고속 지능형 분석</h4>
                            <p className="text-gray-500 text-sm">Gemini AI가 설교의 핵심 정수만을 정확히 포착합니다.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-left p-4 bg-navy-light/40 border border-gold/10 rounded-2xl hover:bg-navy-light/60 transition-colors group">
                        <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20 group-hover:scale-110 transition-transform">
                            <Scissors className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">자동 숏폼 컨텐츠 생성</h4>
                            <p className="text-gray-500 text-sm">쇼츠, 릴스 규격의 클립을 터치 한 번으로 완성합니다.</p>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    onClick={() => router.push('/dashboard')}
                    size="lg"
                    className="w-full h-16 text-xl font-black tracking-widest shadow-gold/20 shadow-2xl hover:scale-[1.02]"
                >
                    대시보드로 시작하기 <ArrowRight className="ml-3 w-6 h-6" />
                </Button>

                <p className="mt-8 text-gray-500 text-sm italic">
                    * 에이아이멘은 복음 전파를 위한 최첨단 AI 기술을 제공합니다.
                </p>
            </div>
        </div>
    );
}
