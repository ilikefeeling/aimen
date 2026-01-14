'use client';

import { Providers } from "./providers";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-navy-darker">
                {/* 서버 렌더링 시에는 빈 뼈대만 노출하여 Hydration 불일치 원천 차단 */}
            </div>
        );
    }

    return (
        <Providers>
            {children}
            <Toaster
                position="top-right"
                richColors
                theme="dark"
                toastOptions={{
                    className: 'bg-navy-light border-gold/20 text-white font-medium shadow-2xl',
                }}
            />
        </Providers>
    );
}
