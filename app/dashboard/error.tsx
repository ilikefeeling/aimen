'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="max-w-md w-full p-8 text-center bg-navy-light/40 border-gold/20 shadow-2xl backdrop-blur-xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>

                <h2 className="text-2xl font-black text-white mb-3 tracking-tight">문제가 발생했습니다</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    데이터를 불러오는 중 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full h-12 shadow-glow shadow-gold/10 font-bold"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" /> 다시 시도하기
                    </Button>

                    <Link href="/dashboard" className="w-full">
                        <Button variant="outline" className="w-full h-12 border-gold/20 text-gold hover:bg-gold/10 font-bold">
                            <Home className="w-4 h-4 mr-2" /> 대시보드 홈으로
                        </Button>
                    </Link>
                </div>

                {error.digest && (
                    <p className="mt-6 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                        Error ID: {error.digest}
                    </p>
                )}
            </Card>
        </div>
    );
}
