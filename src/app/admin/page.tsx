'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface User {
    id: string;
    email: string;
    name: string | null;
    subscriptionStatus: string;
    approvalStatus: string;
    createdAt: string;
    _count: {
        videos: number;
        payments: number;
    };
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated' && session?.user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        if (session?.user.role === 'admin') {
            fetchData();
        }
    }, [status, session]);

    const fetchData = async () => {
        try {
            // Fetch stats
            const statsRes = await fetch('/api/admin/stats');
            const statsData = await statsRes.json();
            setStats(statsData.stats);

            // Fetch users
            await fetchUsers();
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async (filterType?: string) => {
        try {
            const params = new URLSearchParams();
            if (filterType && filterType !== 'all') {
                params.append('approvalStatus', filterType);
            }

            const response = await fetch(`/api/admin/users?${params.toString()}`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleApproval = async (userId: string, status: 'approved' | 'rejected') => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, approvalStatus: status }),
            });

            if (response.ok) {
                fetchUsers(filter);
                fetchData();
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('사용자 업데이트 중 오류가 발생했습니다.');
        }
    };

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        fetchUsers(newFilter);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="text-gold text-xl">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-navy">
            <nav className="bg-navy-light border-b border-gold/20">
                <div className="container mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold text-gold">Admin Dashboard</h1>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-12">
                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <Card>
                            <div className="text-gray-400 text-sm mb-2">총 사용자</div>
                            <div className="text-3xl font-bold text-gold">{stats.totalUsers}</div>
                        </Card>
                        <Card>
                            <div className="text-gray-400 text-sm mb-2">승인 대기</div>
                            <div className="text-3xl font-bold text-yellow-400">{stats.pendingApprovals}</div>
                        </Card>
                        <Card>
                            <div className="text-gray-400 text-sm mb-2">Pro 구독</div>
                            <div className="text-3xl font-bold text-green-400">{stats.activeSubscriptions}</div>
                        </Card>
                        <Card>
                            <div className="text-gray-400 text-sm mb-2">이번 달 수익</div>
                            <div className="text-2xl font-bold text-gold">₩{stats.monthlyRevenue.toLocaleString()}</div>
                        </Card>
                    </div>
                )}

                {/* Users Management */}
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gold">사용자 관리</h2>
                        <div className="flex gap-2">
                            {['all', 'pending', 'approved', 'rejected'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => handleFilterChange(f)}
                                    className={`px-4 py-2 rounded-lg transition-all ${filter === f
                                            ? 'bg-gold text-navy'
                                            : 'bg-navy-lighter text-gray-400 hover:bg-navy'
                                        }`}
                                >
                                    {f === 'all' ? '전체' : f === 'pending' ? '대기' : f === 'approved' ? '승인됨' : '거부됨'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gold/20">
                                    <th className="text-left py-3 px-4 text-gold">이메일</th>
                                    <th className="text-left py-3 px-4 text-gold">이름</th>
                                    <th className="text-left py-3 px-4 text-gold">구독</th>
                                    <th className="text-left py-3 px-4 text-gold">승인 상태</th>
                                    <th className="text-left py-3 px-4 text-gold">영상</th>
                                    <th className="text-left py-3 px-4 text-gold">가입일</th>
                                    <th className="text-left py-3 px-4 text-gold">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gold/10 hover:bg-navy-lighter">
                                        <td className="py-3 px-4 text-gray-300">{user.email}</td>
                                        <td className="py-3 px-4 text-gray-300">{user.name || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs ${user.subscriptionStatus === 'pro'
                                                    ? 'bg-gold text-navy'
                                                    : 'bg-navy text-gray-400'
                                                }`}>
                                                {user.subscriptionStatus.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs ${user.approvalStatus === 'approved'
                                                    ? 'bg-green-600 text-white'
                                                    : user.approvalStatus === 'pending'
                                                        ? 'bg-yellow-600 text-white'
                                                        : 'bg-red-600 text-white'
                                                }`}>
                                                {user.approvalStatus}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-300">{user._count.videos}</td>
                                        <td className="py-3 px-4 text-gray-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                                        </td>
                                        <td className="py-3 px-4">
                                            {user.approvalStatus === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApproval(user.id, 'approved')}
                                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                                    >
                                                        승인
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproval(user.id, 'rejected')}
                                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                                    >
                                                        거부
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                사용자가 없습니다
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
