'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    CreditCard,
    Users,
    Crown,
    TrendingUp,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus
} from 'lucide-react';

interface Payment {
    id: string;
    amount: number;
    status: string;
    paymentKey: string;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        plan: string;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalTransactions: 0 });
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [showGrantModal, setShowGrantModal] = useState(false);
    const [grantUserId, setGrantUserId] = useState('');
    const [grantAmount, setGrantAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, [page]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/payments?page=${page}`);
            if (!res.ok) throw new Error('Failed to fetch payments');
            const data = await res.json();
            setPayments(data.payments);
            setStats(data.stats);
            setPagination(data.pagination);
        } catch (err) {
            toast.error('결제 내역을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleGrantPro = async () => {
        if (!grantUserId) {
            toast.error('사용자 ID를 입력해주세요.');
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch('/api/admin/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: grantUserId,
                    action: 'GRANT_PRO',
                    amount: parseInt(grantAmount) || 0
                })
            });
            if (!res.ok) throw new Error('Failed to grant PRO');

            toast.success('PRO 권한이 부여되었습니다.');
            setShowGrantModal(false);
            setGrantUserId('');
            setGrantAmount('');
            fetchPayments();
        } catch (err) {
            toast.error('PRO 권한 부여에 실패했습니다.');
        } finally {
            setProcessing(false);
        }
    };

    const handleRevokePro = async (userId: string) => {
        if (!confirm('정말 PRO 권한을 해제하시겠습니까?')) return;

        try {
            const res = await fetch('/api/admin/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'REVOKE_PRO' })
            });
            if (!res.ok) throw new Error('Failed to revoke PRO');

            toast.success('PRO 권한이 해제되었습니다.');
            fetchPayments();
        } catch (err) {
            toast.error('PRO 권한 해제에 실패했습니다.');
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white font-cinzel tracking-widest">
                        PAYMENT <span className="text-gold-gradient">MANAGEMENT</span>
                    </h1>
                    <p className="text-gray-500 mt-2">결제 내역 및 구독 관리</p>
                </div>
                <button
                    onClick={() => setShowGrantModal(true)}
                    className="px-6 py-3 bg-gradient-gold text-navy rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-transform shadow-gold"
                >
                    <Plus className="w-5 h-5" />
                    PRO 수동 부여
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 rounded-3xl border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-green-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">총 수익</p>
                            <p className="text-3xl font-black text-white font-cinzel">
                                ₩{stats.totalRevenue.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-8 rounded-3xl border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                            <CreditCard className="w-7 h-7 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">총 거래</p>
                            <p className="text-3xl font-black text-white font-cinzel">
                                {stats.totalTransactions}건
                            </p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-8 rounded-3xl border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center">
                            <Crown className="w-7 h-7 text-gold" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">평균 결제</p>
                            <p className="text-3xl font-black text-white font-cinzel">
                                ₩{stats.totalTransactions > 0
                                    ? Math.round(stats.totalRevenue / stats.totalTransactions).toLocaleString()
                                    : 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="glass-card rounded-3xl border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-black text-white">결제 내역</h2>
                </div>

                {loading ? (
                    <div className="p-20 text-center">
                        <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto" />
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-20 text-center">
                        <CreditCard className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500">결제 내역이 없습니다</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">사용자</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">금액</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">상태</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">결제 키</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">일시</th>
                                    <th className="text-right p-4 text-xs font-black text-gold/60 uppercase tracking-widest">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-navy-lighter flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{payment.user.name || '이름 없음'}</p>
                                                    <p className="text-gray-500 text-xs">{payment.user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white font-black">₩{payment.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`
                                                px-2 py-1 rounded-full text-xs font-bold
                                                ${payment.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                                            `}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-gray-400 text-xs font-mono truncate max-w-[120px]">
                                                {payment.paymentKey}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-gray-400 text-sm">
                                                {new Date(payment.createdAt).toLocaleString('ko-KR')}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end">
                                                {payment.user.plan === 'PRO' && (
                                                    <button
                                                        onClick={() => handleRevokePro(payment.user.id)}
                                                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                        PRO 해제
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
                            총 {pagination.total}건
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-white font-bold px-4">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Grant PRO Modal */}
            {showGrantModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-darker/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card p-8 rounded-3xl max-w-md w-full border-gold/20">
                        <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                            <Crown className="w-6 h-6 text-gold" />
                            PRO 권한 수동 부여
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-gold/60 uppercase tracking-widest mb-2 block">
                                    사용자 ID
                                </label>
                                <input
                                    type="text"
                                    value={grantUserId}
                                    onChange={(e) => setGrantUserId(e.target.value)}
                                    placeholder="cuid 형식의 사용자 ID"
                                    className="w-full px-4 py-3 bg-navy-darker border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gold/60 uppercase tracking-widest mb-2 block">
                                    결제 금액 (선택)
                                </label>
                                <input
                                    type="number"
                                    value={grantAmount}
                                    onChange={(e) => setGrantAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-4 py-3 bg-navy-darker border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/50"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowGrantModal(false)}
                                className="flex-1 py-3 rounded-2xl border border-white/10 text-gray-400 font-bold hover:bg-white/5"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleGrantPro}
                                disabled={processing}
                                className="flex-1 py-3 rounded-2xl bg-gradient-gold text-navy font-black hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'PRO 부여'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
