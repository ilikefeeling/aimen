'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Video,
    ChevronLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ExternalLink,
    Play,
    Download,
    Share2,
    Scissors,
    Sparkles,
    FileText
} from 'lucide-react';

interface Clip {
    id: string;
    platform: string;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    status: string;
}

interface Highlight {
    id: string;
    title: string;
    startTime: string | number;
    endTime: string | number;
    videoUrl: string;
    caption: string | null;
    createdAt: string;
    clips?: Clip[];
}

interface Sermon {
    id: string;
    title: string;
    videoUrl: string;
    churchName: string | null;
    analysisData: any;
    createdAt: string;
}

export default function VideoDetailPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.id as string;

    const [sermon, setSermon] = useState<Sermon | null>(null);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (videoId) {
            fetchVideoDetails();
        }
    }, [videoId]);

    const fetchVideoDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/sermons/${videoId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch video details');
            }

            setSermon(data.sermon);
            setHighlights(data.highlights || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch video details:', err);
            setError(err instanceof Error ? err.message : '영상 정보를 불러오는데 실패했습니다.');
            setLoading(false);
        }
    };

    const formatTime = (seconds: number | string) => {
        const num = typeof seconds === 'string' ? parseInt(seconds) : seconds;
        if (isNaN(num)) return '0:00';
        const mins = Math.floor(num / 60);
        const secs = num % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                <p className="text-gray-400 font-medium">은혜로운 영상을 불러오는 중...</p>
            </div>
        );
    }

    if (error || !sermon) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-4">
                <Card className="text-center p-12 bg-navy-light/40 border-red-500/20">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">영상을 찾을 수 없습니다</h2>
                    <p className="text-gray-400 mb-8">
                        {error || '요청하신 영상이 존재하지 않거나 접근 권한이 없습니다.'}
                    </p>
                    <Link href="/dashboard/videos">
                        <Button className="w-full">영상 목록으로 돌아가기</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const analysisData = sermon.analysisData || {};
    const status = analysisData.status;
    const summary = analysisData.summary;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gold/10">
                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/dashboard/videos')}
                        className="flex items-center gap-2 text-gold hover:text-white transition-colors text-sm font-bold group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        아카이브로 돌아가기
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            {sermon.title}
                        </h1>
                        <div className="flex items-center gap-3 mt-3">
                            {sermon.churchName && (
                                <span className="text-gold font-bold px-3 py-1 bg-gold/10 rounded-full text-xs border border-gold/20">
                                    {sermon.churchName}
                                </span>
                            )}
                            <span className="text-gray-500 text-sm">
                                {new Date(sermon.createdAt).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    {status === 'COMPLETED' && (
                        <span className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl text-sm font-bold border border-green-500/30 shadow-glow-green">
                            <CheckCircle2 className="w-4 h-4" /> 분석 완료
                        </span>
                    )}
                    {status === 'ANALYZING' && (
                        <span className="flex items-center gap-1.5 px-4 py-2 bg-gold/10 text-gold rounded-xl text-sm font-bold border border-gold/30">
                            <Loader2 className="w-4 h-4 animate-spin" /> 분석 진행 중
                        </span>
                    )}
                    {status === 'FAILED' && (
                        <span className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold border border-red-500/30">
                            <AlertCircle className="w-4 h-4" /> 분석 실패
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Video & Summary */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Primary Video Card */}
                    <Card className="overflow-hidden p-0 bg-black border-gold/20 shadow-2xl">
                        <div className="relative aspect-video group">
                            <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <a
                                    href={sermon.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-20 h-20 bg-gold text-navy rounded-full flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform z-10"
                                    title="원본 영상 재생"
                                >
                                    <Play className="w-10 h-10 fill-current ml-1" />
                                </a>
                            </div>
                            {/* Placeholder/Thumb (since we don't have images) */}
                            <div className="w-full h-full bg-navy-lighter/30 flex items-center justify-center">
                                <Video className="w-32 h-32 text-gold/10" />
                            </div>
                        </div>
                        <div className="p-6 bg-navy-light flex items-center justify-between border-t border-gold/10">
                            <p className="text-gray-400 text-sm italic">
                                * 원본 영상은 Supabase Storage에서 안전하게 관리되고 있습니다.
                            </p>
                            <a
                                href={sermon.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="전체 영상 보기"
                            >
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" /> 전체 영상 보기
                                </Button>
                            </a>
                        </div>
                    </Card>

                    {/* AI Summary Card */}
                    {status === 'COMPLETED' && summary && (
                        <Card className="p-8 bg-navy-light/40 border-gold/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                <Sparkles className="w-32 h-32 text-gold" />
                            </div>
                            <h2 className="text-2xl font-bold text-gold mb-6 flex items-center gap-3">
                                <FileText className="w-6 h-6" /> AI 말씀 분석 정수
                            </h2>
                            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                                {summary}
                            </p>
                        </Card>
                    )}

                    {/* Analyzing/Failed States for Summary */}
                    {status === 'ANALYZING' && (
                        <Card className="p-12 text-center bg-navy-light/20 border-dashed border-gold/20">
                            <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-6 opacity-50" />
                            <h3 className="text-xl font-bold text-white mb-2">AI가 내용을 정리하고 있습니다</h3>
                            <p className="text-gray-500">잠시 후 다시 확인해주세요. 은혜로운 요약이 곧 완성됩니다.</p>
                        </Card>
                    )}
                </div>

                {/* Right Column: Highlights List */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 italic">
                        <Scissors className="w-6 h-6 text-gold" /> AI HIGHLIGHTS
                        {highlights.length > 0 && (
                            <span className="not-italic text-sm font-bold bg-gold/10 text-gold px-2 py-0.5 rounded-md ml-auto">
                                {highlights.length}
                            </span>
                        )}
                    </h2>

                    {status === 'COMPLETED' ? (
                        <div className="space-y-4">
                            {highlights.length === 0 ? (
                                <Card className="p-10 text-center bg-navy-lighter/20 border-gold/5">
                                    <p className="text-gray-500">추출된 하이라이트가 없습니다.</p>
                                </Card>
                            ) : (
                                highlights.map((highlight, index) => {
                                    const clip = highlight.clips?.[0];
                                    const clipUrl = clip?.videoUrl || highlight.videoUrl;
                                    const hasClip = clip?.status === 'COMPLETED';

                                    return (
                                        <Card
                                            key={highlight.id}
                                            className="p-5 bg-navy-light/60 border-gold/10 hover:border-gold/40 hover:bg-navy-light transition-all group"
                                        >
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 flex items-center justify-center bg-gold text-navy font-black rounded-lg text-sm">
                                                            {index + 1}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {formatTime(highlight.startTime)} - {formatTime(highlight.endTime)}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button className="p-2 hover:bg-gold/10 text-gray-400 hover:text-gold rounded-lg transition-colors" title="다운로드">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 hover:bg-gold/10 text-gray-400 hover:text-gold rounded-lg transition-colors" title="공유">
                                                            <Share2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Clip Thumbnail/Preview Area */}
                                                <div className="relative aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/5 group-hover:border-gold/20 transition-colors">
                                                    {clip?.thumbnailUrl ? (
                                                        <img
                                                            src={clip.thumbnailUrl}
                                                            alt={highlight.title}
                                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Video className="w-10 h-10 text-gold/10" />
                                                        </div>
                                                    )}

                                                    {!hasClip && clip?.status === 'PROCESSING' && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/60 backdrop-blur-sm">
                                                            <Loader2 className="w-6 h-6 text-gold animate-spin mb-2" />
                                                            <span className="text-[10px] text-gold/80 font-bold">추출 중...</span>
                                                        </div>
                                                    )}

                                                    {hasClip && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-12 h-12 bg-gold text-navy rounded-full flex items-center justify-center shadow-glow transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                                <Play className="w-6 h-6 fill-current ml-1" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {highlight.caption && (
                                                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 italic font-medium">
                                                        "{highlight.caption}"
                                                    </p>
                                                )}

                                                <a
                                                    href={clipUrl || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`mt-2 ${!clipUrl ? 'pointer-events-none opacity-50' : ''}`}
                                                    title="클립 보기"
                                                >
                                                    <Button className="w-full text-xs py-2 bg-navy-lighter hover:bg-gold hover:text-navy border border-gold/20 shadow-none">
                                                        <Play className="w-3 h-3 mr-2" />
                                                        {hasClip ? '클립 보기' : clip?.status === 'PROCESSING' ? '추출 진행 중' : '원본 영상 확인'}
                                                    </Button>
                                                </a>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 opacity-50 grayscale pointer-events-none">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="p-5 bg-navy-light/20 border-white/5 h-32">
                                    <div />
                                </Card>
                            ))}
                        </div>
                    )}

                    <Card className="p-6 bg-gradient-to-br from-gold/5 to-transparent border-gold/10">
                        <h4 className="text-sm font-bold text-gold mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Tip
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            AI가 추출한 하이라이트는 숏폼(9:16) 형식으로 최적화되어 있습니다. 쇼츠나 릴스에 바로 업로드해보세요!
                        </p>
                    </Card>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="pt-12 pb-8 border-t border-gold/10 flex flex-col md:flex-row items-center justify-center gap-4">
                <Link href="/dashboard/videos">
                    <Button variant="outline" className="w-full md:w-auto px-10 py-6 border-gold/30 text-gold hover:bg-gold/10">
                        <ChevronLeft className="w-4 h-4 mr-2" /> 목록으로 돌아가기
                    </Button>
                </Link>
                <Link href="/dashboard/upload">
                    <Button className="w-full md:w-auto px-10 py-6 shadow-glow">
                        다른 영상 분석하기
                    </Button>
                </Link>
            </div>
        </div>
    );
}
