'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function FailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const message = searchParams.get('message') || '결제 중 오류가 발생했습니다.';
    const code = searchParams.get('code');

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <Card className="max-w-2xl w-full p-12 md:p-16 text-center bg-red-500/5 border-red-500/20 rounded-[3rem] space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -z-10" />

                <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>

                <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-widest uppercase">
                        Payment Failed
                    </h2>
                    <div className="space-y-2">
                        <p className="text-red-400 font-bold text-lg">{message}</p>
                        {code && (
                            <p className="text-gray-600 text-xs font-mono uppercase tracking-widest">
                                Error Code: {code}
                            </p>
                        )}
                    </div>
                    <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
                        결제 과정에서 일시적인 문제가 발생했거나 사용자에 의해 취소되었습니다. <br />
                        문제가 지속되면 고객센터로 문의해주세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <Button
                        onClick={() => router.push('/dashboard/upgrade')}
                        className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black transition-all border-none flex items-center justify-center gap-3"
                    >
                        <RefreshCcw className="w-4 h-4" /> 다시 시도하기
                    </Button>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="glass-panel text-white py-4 rounded-2xl font-bold transition-all border-white/5 flex items-center justify-center gap-3"
                    >
                        <Home className="w-4 h-4" /> 대시보드로 이동
                    </Button>
                </div>

                <p className="text-[10px] text-gray-700 font-bold tracking-[0.3em] uppercase">
                    AI-men · Divine Content Engine Support
                </p>
            </Card>
        </div>
    );
}
