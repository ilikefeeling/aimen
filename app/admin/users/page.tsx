'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Users,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    Crown,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    status: string;
    plan: string;
    createdAt: string;
    _count: {
        sermons: number;
        payments: number;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, [page, statusFilter, planFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set('page', page.toString());
            if (statusFilter) params.set('status', statusFilter);
            if (planFilter) params.set('plan', planFilter);
            if (search) params.set('search', search);

            const res = await fetch(`/api/admin/users?${params}`);
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (err) {
            toast.error('사용자 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const updateUser = async (userId: string, updates: { status?: string; plan?: string }) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...updates })
            });
            if (!res.ok) throw new Error('Failed to update user');
            const data = await res.json();

            setUsers(users.map(u => u.id === userId ? { ...u, ...data.user } : u));
            toast.success('사용자 정보가 업데이트되었습니다.');
        } catch (err) {
            toast.error('사용자 정보 업데이트에 실패했습니다.');
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white font-cinzel tracking-widest">
                        USER <span className="text-gold-gradient">MANAGEMENT</span>
                    </h1>
                    <p className="text-gray-500 mt-2">사용자 승인 및 구독 관리</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-bold">
                        대기: {users.filter(u => u.status === 'PENDING').length}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-bold">
                        PRO: {users.filter(u => u.plan === 'PRO').length}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-6 rounded-3xl border-white/5">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="이름 또는 이메일로 검색..."
                                className="w-full pl-12 pr-4 py-3 bg-navy-darker border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/50"
                            />
                        </div>
                    </form>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="px-4 py-3 bg-navy-darker border border-white/10 rounded-2xl text-white focus:outline-none focus:border-gold/50"
                        >
                            <option value="">모든 상태</option>
                            <option value="PENDING">대기 중</option>
                            <option value="ACTIVE">활성</option>
                        </select>
                        <select
                            value={planFilter}
                            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                            className="px-4 py-3 bg-navy-darker border border-white/10 rounded-2xl text-white focus:outline-none focus:border-gold/50"
                        >
                            <option value="">모든 플랜</option>
                            <option value="FREE">FREE</option>
                            <option value="PRO">PRO</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card rounded-3xl border-white/5 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-20 text-center">
                        <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500">조건에 맞는 사용자가 없습니다</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">사용자</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">상태</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">플랜</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">콘텐츠</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">가입일</th>
                                    <th className="text-right p-4 text-xs font-black text-gold/60 uppercase tracking-widest">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-navy-lighter overflow-hidden flex items-center justify-center">
                                                    {user.image ? (
                                                        <img src={user.image} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users className="w-4 h-4 text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{user.name || '이름 없음'}</p>
                                                    <p className="text-gray-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`
                                                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
                                                ${user.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                                            `}>
                                                {user.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`
                                                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
                                                ${user.plan === 'PRO' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}
                                            `}>
                                                {user.plan === 'PRO' && <Crown className="w-3 h-3" />}
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white text-sm">{user._count.sermons} 설교</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-gray-400 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => updateUser(user.id, { status: 'ACTIVE' })}
                                                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-xl text-xs font-bold hover:bg-green-500 hover:text-white transition-all"
                                                    >
                                                        승인
                                                    </button>
                                                )}
                                                {user.plan === 'FREE' ? (
                                                    <button
                                                        onClick={() => updateUser(user.id, { plan: 'PRO' })}
                                                        className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500 hover:text-white transition-all"
                                                    >
                                                        PRO 부여
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => updateUser(user.id, { plan: 'FREE' })}
                                                        className="px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded-xl text-xs font-bold hover:bg-gray-500 hover:text-white transition-all"
                                                    >
                                                        FREE 변경
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-between">
                        <p className="text-gray-500 text-sm">
                            총 {pagination.total}명 중 {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-white font-bold px-4">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
