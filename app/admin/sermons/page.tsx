'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    Video,
    Users,
    Loader2,
    ExternalLink,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';

interface Sermon {
    id: string;
    title: string;
    videoUrl: string;
    churchName: string | null;
    analysisData: any;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
    _count: {
        highlights: number;
    };
}

export default function AdminSermonsPage() {
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchSermons();
    }, [page]);

    const fetchSermons = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/sermons?page=${page}&limit=${limit}&admin=true`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setSermons(data.sermons || []);
            setTotal(data.total || 0);
        } catch (err) {
            toast.error('설교 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const deleteSermon = async (id: string) => {
        if (!confirm('정말 이 설교를 삭제하시겠습니까? 관련 하이라이트도 함께 삭제됩니다.')) return;

        try {
            const res = await fetch(`/api/sermons/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            toast.success('설교가 삭제되었습니다.');
            setSermons(sermons.filter(s => s.id !== id));
        } catch (err) {
            toast.error('삭제에 실패했습니다.');
        }
    };

    const getAnalysisStatus = (data: any) => {
        if (!data) return { text: '미분석', color: 'gray' };
        if (data.status === 'COMPLETED') return { text: '완료', color: 'green' };
        if (data.status === 'ANALYZING') return { text: '분석 중', color: 'gold' };
        if (data.status === 'FAILED') return { text: '실패', color: 'red' };
        return { text: '대기', color: 'gray' };
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white font-cinzel tracking-widest">
                        SERMON <span className="text-gold-gradient">CONTENT</span>
                    </h1>
                    <p className="text-gray-500 mt-2">전체 설교 영상 및 분석 관리</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-gold/20 text-gold font-bold">
                        총 {total}개 설교
                    </span>
                </div>
            </div>

            {/* Sermons Table */}
            <div className="glass-card rounded-3xl border-white/5 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto" />
                    </div>
                ) : sermons.length === 0 ? (
                    <div className="p-20 text-center">
                        <Video className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500">등록된 설교가 없습니다</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">설교</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">업로더</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">분석 상태</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">하이라이트</th>
                                    <th className="text-left p-4 text-xs font-black text-gold/60 uppercase tracking-widest">업로드일</th>
                                    <th className="text-right p-4 text-xs font-black text-gold/60 uppercase tracking-widest">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sermons.map((sermon) => {
                                    const status = getAnalysisStatus(sermon.analysisData);
                                    return (
                                        <tr key={sermon.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-navy-lighter flex items-center justify-center">
                                                        <Video className="w-5 h-5 text-gold/50" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold truncate max-w-[200px]">{sermon.title}</p>
                                                        {sermon.churchName && (
                                                            <p className="text-gold/60 text-xs">{sermon.churchName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-white text-sm">{sermon.user.name || '이름 없음'}</p>
                                                <p className="text-gray-500 text-xs">{sermon.user.email}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`
                                                    px-2 py-1 rounded-full text-xs font-bold
                                                    ${status.color === 'green' ? 'bg-green-500/20 text-green-400' : ''}
                                                    ${status.color === 'gold' ? 'bg-gold/20 text-gold' : ''}
                                                    ${status.color === 'red' ? 'bg-red-500/20 text-red-400' : ''}
                                                    ${status.color === 'gray' ? 'bg-gray-500/20 text-gray-400' : ''}
                                                `}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-gold/50" />
                                                    <span className="text-white font-bold">{sermon._count.highlights}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-gray-400 text-sm">
                                                    {new Date(sermon.createdAt).toLocaleDateString('ko-KR')}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/dashboard/videos/${sermon.id}`}
                                                        className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-gold/20 hover:text-gold transition-all"
                                                        title="상세 보기"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteSermon(sermon.id)}
                                                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                                        title="삭제"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-between">
                        <p className="text-gray-500 text-sm">총 {total}개</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-white font-bold px-4">{page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30"
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
