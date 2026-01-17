'use client';

import { useEffect, useState } from 'react';
import { resolveApiUrl } from '@/lib/api/config';
import Link from 'next/link';
import {
    Users,
    Video,
    CreditCard,
    TrendingUp,
    Clock,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Sparkles,
    ArrowUpRight
} from 'lucide-react';

interface Stats {
    users: {
        total: number;
        pending: number;
        active: number;
        pro: number;
    };
    content: {
        sermons: number;
        highlights: number;
    };
    revenue: {
        total: number;
    };
}

interface RecentUser {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    status: string;
    plan: string;
    createdAt: string;
}

interface RecentSermon {
    id: string;
    title: string;
    createdAt: string;
    user: { name: string | null; email: string | null };
    _count: { highlights: number };
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [recentSermons, setRecentSermons] = useState<RecentSermon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(resolveApiUrl('/api/admin/stats'));
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStats(data.stats);
            setRecentUsers(data.recent.users);
            setRecentSermons(data.recent.sermons);
        } catch (err) {
            setError('통계 데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-gold animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <div className="glass-card p-12 text-center rounded-3xl">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                    <p className="text-red-400 font-bold text-lg">{error}</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: '총 사용자',
            value: stats?.users.total || 0,
            icon: Users,
            color: 'gold',
            sub: `승인 대기: ${stats?.users.pending || 0}`
        },
        {
            label: '활성 사용자',
            value: stats?.users.active || 0,
            icon: CheckCircle2,
            color: 'green',
            sub: `PRO: ${stats?.users.pro || 0}`
        },
        {
            label: '총 설교',
            value: stats?.content.sermons || 0,
            icon: Video,
            color: 'blue',
            sub: `하이라이트: ${stats?.content.highlights || 0}`
        },
        {
            label: '총 수익',
            value: `₩${(stats?.revenue.total || 0).toLocaleString()}`,
            icon: CreditCard,
            color: 'purple',
            sub: '누적 결제액'
        },
    ];

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-gold animate-pulse" />
                    <p className="text-gold text-xs font-black uppercase tracking-[0.3em]">
                        Admin Overview
                    </p>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white font-cinzel tracking-widest">
                    CONTROL <span className="text-gold-gradient">CENTER</span>
                </h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className="glass-card p-8 rounded-3xl border-white/5 hover:border-gold/20 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`
                                w-14 h-14 rounded-2xl flex items-center justify-center
                                ${card.color === 'gold' ? 'bg-gold/10 text-gold' : ''}
                                ${card.color === 'green' ? 'bg-green-500/10 text-green-400' : ''}
                                ${card.color === 'blue' ? 'bg-blue-500/10 text-blue-400' : ''}
                                ${card.color === 'purple' ? 'bg-purple-500/10 text-purple-400' : ''}
                                group-hover:scale-110 transition-transform
                            `}>
                                <card.icon className="w-7 h-7" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-400 opacity-50" />
                        </div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">
                            {card.label}
                        </p>
                        <p className="text-4xl font-black text-white font-cinzel">
                            {card.value}
                        </p>
                        <p className="text-xs text-gray-600 mt-2 font-medium">
                            {card.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="glass-card p-8 rounded-3xl border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-white flex items-center gap-3">
                            <Users className="w-5 h-5 text-gold" />
                            최근 가입자
                        </h2>
                        <Link
                            href="/admin/users"
                            className="text-gold text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                            전체보기 <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentUsers.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">가입자가 없습니다</p>
                        ) : (
                            recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors">
                                    <div className="w-12 h-12 bg-navy-lighter rounded-xl flex items-center justify-center overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-5 h-5 text-gray-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold truncate">
                                            {user.name || '이름 없음'}
                                        </p>
                                        <p className="text-gray-500 text-xs truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-[10px] font-black uppercase
                                            ${user.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                                        `}>
                                            {user.status}
                                        </span>
                                        <span className="text-gray-600 text-[10px]">
                                            {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Sermons */}
                <div className="glass-card p-8 rounded-3xl border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-white flex items-center gap-3">
                            <Video className="w-5 h-5 text-gold" />
                            최근 업로드
                        </h2>
                        <Link
                            href="/admin/sermons"
                            className="text-gold text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                            전체보기 <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentSermons.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">업로드된 설교가 없습니다</p>
                        ) : (
                            recentSermons.map((sermon) => (
                                <div key={sermon.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors">
                                    <div className="w-12 h-12 bg-navy-lighter rounded-xl flex items-center justify-center">
                                        <Video className="w-5 h-5 text-gold/50" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold truncate">
                                            {sermon.title}
                                        </p>
                                        <p className="text-gray-500 text-xs truncate">
                                            {sermon.user.name || sermon.user.email}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gold/20 text-gold">
                                            {sermon._count.highlights} clips
                                        </span>
                                        <span className="text-gray-600 text-[10px]">
                                            {new Date(sermon.createdAt).toLocaleDateString('ko-KR')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-panel p-8 rounded-3xl border-gold/10">
                <h3 className="text-lg font-black text-gold mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    빠른 작업
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/admin/users?status=PENDING" className="p-4 rounded-2xl bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors text-center">
                        <p className="text-yellow-400 text-2xl font-black font-cinzel">{stats?.users.pending || 0}</p>
                        <p className="text-yellow-400/70 text-xs font-bold mt-1">승인 대기</p>
                    </Link>
                    <Link href="/admin/users?plan=PRO" className="p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors text-center">
                        <p className="text-purple-400 text-2xl font-black font-cinzel">{stats?.users.pro || 0}</p>
                        <p className="text-purple-400/70 text-xs font-bold mt-1">PRO 회원</p>
                    </Link>
                    <Link href="/admin/sermons" className="p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-center">
                        <p className="text-blue-400 text-2xl font-black font-cinzel">{stats?.content.sermons || 0}</p>
                        <p className="text-blue-400/70 text-xs font-bold mt-1">전체 설교</p>
                    </Link>
                    <Link href="/admin/payments" className="p-4 rounded-2xl bg-green-500/10 hover:bg-green-500/20 transition-colors text-center">
                        <p className="text-green-400 text-2xl font-black font-cinzel">{stats?.content.highlights || 0}</p>
                        <p className="text-green-400/70 text-xs font-bold mt-1">생성된 클립</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
