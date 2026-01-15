'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Video,
    CreditCard,
    Shield,
    ChevronLeft,
    Menu,
    X,
    Loader2
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Sermons', path: '/admin/sermons', icon: Video },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user) {
            router.push('/login');
            return;
        }

        // Check admin role
        if ((session.user as any).role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }

        setIsAuthorized(true);
        setChecking(false);
    }, [session, status, router]);

    if (status === 'loading' || checking) {
        return (
            <div className="min-h-screen bg-navy-darker flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                        <Shield className="w-10 h-10 text-gold" />
                    </div>
                    <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" />
                    <p className="text-gray-400 font-bold">관리자 권한 확인 중...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-navy-darker">
            {/* Divine Aura Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gold/[0.03] blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gold/[0.02] blur-[120px] rounded-full" />
            </div>

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 glass-panel border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo & Back */}
                        <div className="flex items-center gap-6">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors text-sm font-bold"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden md:inline">사용자 대시보드</span>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shadow-divine p-1.5 border border-white/10">
                                    <img src="/logo.png" alt="aimen logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-black text-white font-cinzel tracking-widest">
                                        ADMIN
                                    </h1>
                                    <p className="text-[10px] text-gold/60 font-bold uppercase tracking-widest">
                                        Control Center
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-2">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`
                                            flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all
                                            ${isActive
                                                ? 'bg-gold text-navy shadow-gold'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-gray-400 hover:text-white"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <nav className="md:hidden border-t border-white/5 p-4 space-y-2 animate-fade-in">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                                        ${isActive
                                            ? 'bg-gold text-navy'
                                            : 'text-gray-400 hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </header>

            {/* Main Content */}
            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
}
