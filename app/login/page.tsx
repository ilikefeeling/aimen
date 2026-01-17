'use client';

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Shield, Video, Scissors, ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/videos";

    const handleKakaoLogin = async () => {
        await signIn("kakao", {
            callbackUrl: "/dashboard/login-success",
        });
    };

    return (
        <div className="min-h-screen bg-navy-darker flex items-center justify-center p-4 relative overflow-hidden">
            {/* Divine Aura Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gold/[0.03] blur-[150px] rounded-full" />
            </div>

            {/* Back to Home Button */}
            <button
                onClick={() => router.push('/')}
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gold transition-colors font-bold text-sm group"
            >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                홈으로 돌아가기
            </button>

            <div className="glass-card p-12 rounded-[3rem] max-w-md w-full relative z-10 border-gold/20">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div
                        className="inline-flex items-center justify-center mb-6 cursor-pointer group"
                        onClick={() => router.push('/')}
                    >
                        <div className="w-24 h-24 bg-white/5 rounded-3xl p-4 glass-panel border-gold/20 shadow-divine group-hover:scale-110 transition-transform duration-500">
                            <img src="/logo.png" alt="aimen logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <h1
                        className="text-5xl font-black text-white font-cinzel tracking-widest mb-4 cursor-pointer hover:text-gold transition-colors"
                        onClick={() => router.push('/')}
                    >
                        ai<span className="text-gold-gradient">men</span>
                    </h1>
                    <p className="text-gray-400 font-medium">
                        AI 기반 설교 콘텐츠 자동화
                    </p>
                </div>

                {/* Features */}
                <div className="mb-10 p-6 glass-panel rounded-2xl border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-gray-300 text-sm">
                        <Video className="w-5 h-5 text-gold" />
                        <span>설교 영상을 업로드하면</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 text-sm">
                        <Sparkles className="w-5 h-5 text-gold" />
                        <span>AI가 자동으로 핵심 메시지를 찾아</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 text-sm">
                        <Scissors className="w-5 h-5 text-gold" />
                        <span>숏폼 콘텐츠로 만들어드립니다</span>
                    </div>
                </div>

                {/* Kakao Login Button */}
                <button
                    onClick={handleKakaoLogin}
                    className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] font-black py-5 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-xl text-lg border-none"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3C6.477 3 2 6.477 2 10.737c0 2.618 1.693 4.93 4.244 6.278-.149.55-.96 3.549-.99 3.776 0 0-.02.166.087.229.107.063.234.017.234.017.309-.043 3.573-2.335 4.135-2.729.752.112 1.529.171 2.29.171 5.523 0 10-3.477 10-7.742S17.523 3 12 3z" />
                    </svg>
                    카카오로 3초 로그인
                </button>

                {/* Footer */}
                <p className="text-center text-xs text-gray-600 mt-8 leading-relaxed">
                    로그인하시면 <a href="#" className="text-gold hover:underline">서비스 이용약관</a> 및<br />
                    <a href="#" className="text-gold hover:underline">개인정보 처리방침</a>에 동의하게 됩니다
                </p>
            </div>

            {/* Trust Badges */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-gray-600 text-xs">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>안전한 카카오 인증</span>
                </div>
                <div className="w-1 h-1 bg-gray-700 rounded-full" />
                <span>© 2024 aimen</span>
            </div>
        </div>
    );
}
