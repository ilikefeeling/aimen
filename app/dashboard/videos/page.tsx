'use client';

import { useEffect, useState } from 'react';
import { resolveApiUrl } from '@/lib/api/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Video, Clock, CheckCircle2, AlertCircle, Loader2, Plus, ExternalLink, Play } from 'lucide-react';

interface Sermon {
    id: string;
    title: string;
    videoUrl: string;
    churchName: string | null;
    analysisData: any;
    createdAt: string;
}

export default function VideosPage() {
    const router = useRouter();
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSermons();
    }, []);

    const fetchSermons = async () => {
        try {
            const response = await fetch(resolveApiUrl('/api/sermons'));
            if (!response.ok) throw new Error('Failed to fetch sermons');
            const data = await response.json();
            setSermons(data.sermons || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch sermons:', err);
            setError('영상 목록을 불러오는데 실패했습니다.');
            setLoading(false);
        }
    };

    const getStatusBadge = (analysisData: any) => {
        if (!analysisData) {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-navy-lighter text-gray-400 rounded-full text-xs font-medium border border-gold/10">
                    <Clock className="w-3 h-3" /> 대기 중
                </span>
            );
        }

        const status = analysisData.status;

        if (status === 'ANALYZING') {
            const progress = analysisData.progress || 0;
            return (
                <div className="flex flex-col items-end gap-1.5">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium border border-gold/30">
                        <Loader2 className="w-3 h-3 animate-spin" /> 분석 중 {progress}%
                    </span>
                    <div className="w-24 bg-navy-lighter rounded-full h-1 overflow-hidden">
                        <div className="bg-gold h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            );
        }

        if (status === 'COMPLETED') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                    <CheckCircle2 className="w-3 h-3" /> 분석 완료
                </span>
            );
        }

        if (status === 'FAILED') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
                    <AlertCircle className="w-3 h-3" /> 분석 실패
                </span>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">영상 목록을 불러오고 있습니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 animate-fade-in relative">
            {/* Background Divine Ambience */}
            <div className="absolute top-[-100px] right-0 w-[600px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/5">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase font-cinzel">
                        Sermon <span className="text-gold-gradient">Archive</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium">
                        기름 부으심이 있는 설교 영상을 관리하고 은혜로운 숏폼을 생성하세요.
                    </p>
                </div>
                <Link href="/dashboard/upload">
                    <Button className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] px-8 py-4 rounded-2xl font-black shadow-gold flex items-center gap-3 hover:scale-105 transition-transform border-none">
                        <Plus className="w-6 h-6 stroke-[3]" /> 새 영상 업로드
                    </Button>
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-400 flex items-center gap-4 animate-glow-pulse">
                    <AlertCircle className="w-6 h-6" />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            {/* Videos Grid */}
            {sermons.length === 0 ? (
                <div className="glass-card p-24 text-center rounded-[3rem] border-divine relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="w-32 h-32 bg-navy-lighter rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-gold/10 shadow-divine group-hover:rotate-12 transition-transform duration-500">
                        <Video className="w-16 h-16 text-gold/30 animate-glimmer" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-6 font-cinzel tracking-widest">
                        EMPTY SANCTUARY
                    </h2>
                    <p className="text-xl text-gray-500 mb-12 max-w-lg mx-auto leading-relaxed font-medium">
                        아직 업로드된 설교가 없습니다. <br />
                        첫 번째 영상을 업로드하여 AI 분석을 시작하세요.
                    </p>
                    <Link href="/dashboard/upload">
                        <Button size="lg" className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] shadow-gold hover:scale-105 transition-all rounded-2xl px-12 py-6 text-xl font-black border-none">
                            사역 시작하기
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {sermons.map((sermon) => (
                        <div
                            key={sermon.id}
                            className="glass-card group rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col h-full hover:border-gold/30"
                        >
                            {/* Thumbnail Area */}
                            <div className="aspect-video bg-navy-darker relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-darker to-transparent opacity-60 z-10" />
                                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-125 transition-transform duration-700">
                                    <Video className="w-16 h-16 text-gold/5" />
                                </div>
                                <div className="absolute top-4 right-4 z-20">
                                    {getStatusBadge(sermon.analysisData)}
                                </div>

                                {/* Hover Play Overlay */}
                                <div
                                    className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-navy-darker/60 backdrop-blur-[2px] transition-all duration-300 cursor-pointer"
                                    onClick={() => router.push(`/dashboard/videos/detail?id=${sermon.id}`)}
                                >
                                    <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold-lg transform scale-50 group-hover:scale-100 transition-transform duration-500">
                                        <Play className="w-10 h-10 text-navy fill-current ml-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="p-8 flex-1 flex flex-col space-y-6">
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-3 line-clamp-1 group-hover:text-gold transition-colors tracking-tight">
                                        {sermon.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{new Date(sermon.createdAt).toLocaleDateString('ko-KR')}</span>
                                        {sermon.churchName && (
                                            <>
                                                <span className="text-gold/20">•</span>
                                                <span className="text-gold/60">{sermon.churchName}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-4">
                                    <Link
                                        href={`/dashboard/videos/detail?id=${sermon.id}`}
                                        className="w-full bg-gold/10 hover:bg-gold text-gold hover:text-navy py-4 rounded-2xl font-black text-sm transition-all border border-gold/20 text-center flex items-center justify-center"
                                    >
                                        상세 분석
                                    </Link>
                                    <a
                                        href={sermon.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full"
                                    >
                                        <button
                                            type="button"
                                            className="w-full glass-panel hover:bg-white/10 text-white/70 hover:text-white py-4 rounded-2xl font-bold text-sm transition-all border border-white/5 flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" /> 원본
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
