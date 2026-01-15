'use client';

import React, { useState, useRef } from 'react';
import { Highlight } from '@/types';
import { processHighlight, getVideoDuration, EditProgress } from '@/lib/ffmpeg/editor';
import { secondsToTime } from '@/lib/gemini/client';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import {
    Scissors,
    Download,
    Share2,
    Play,
    Clock,
    FileText,
    Sparkles,
    Loader2,
    Video,
    CheckCircle2
} from 'lucide-react';

interface VideoEditorProps {
    videoFile: File;
    highlights: Highlight[];
}

export function VideoEditor({ videoFile, highlights }: VideoEditorProps) {
    const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<EditProgress | null>(null);
    const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleProcessHighlight = async (highlight: Highlight) => {
        setIsProcessing(true);
        setProgress({ stage: 'loading', progress: 0, message: '편집 도구 로딩 중...' });
        setProcessedVideoUrl(null);

        try {
            const blob = await processHighlight(
                videoFile,
                {
                    startTime: secondsToTime(highlight.startTime),
                    endTime: secondsToTime(highlight.endTime),
                    watermarkText: 'aimen | 에이아이멘',
                    outputFormat: 'mp4',
                },
                setProgress
            );

            const url = URL.createObjectURL(blob);
            setProcessedVideoUrl(url);
            setSelectedHighlight(highlight);
        } catch (error) {
            console.error('Error processing highlight:', error);
            alert('영상 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsProcessing(false);
            setProgress(null);
        }
    };

    const handleDownload = () => {
        if (!processedVideoUrl || !selectedHighlight) return;

        const a = document.createElement('a');
        a.href = processedVideoUrl;
        a.download = `${selectedHighlight.title}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleShare = async () => {
        if (!selectedHighlight) return;

        const shareData = {
            title: selectedHighlight.title,
            text: selectedHighlight.caption,
        };

        if (navigator.share && processedVideoUrl) {
            try {
                const response = await fetch(processedVideoUrl);
                const blob = await response.blob();
                const file = new File([blob], `${selectedHighlight.title}.mp4`, { type: 'video/mp4' });

                await navigator.share({
                    ...shareData,
                    files: [file],
                });
            } catch (error) {
                console.error('Error sharing:', error);
                await navigator.clipboard.writeText(selectedHighlight.caption);
                alert('캡션이 클립보드에 복사되었습니다!');
            }
        } else {
            await navigator.clipboard.writeText(selectedHighlight.caption);
            alert('캡션이 클립보드에 복사되었습니다!');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gold/10 pb-6">
                <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20">
                    <Scissors className="w-6 h-6 text-gold" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">하이라이트 편집실</h2>
                    <p className="text-gray-500 text-sm font-medium">AI가 추천한 순간들을 숏폼 컨텐츠로 변환합니다.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Highlights List */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xl font-bold text-gold flex items-center gap-2 italic">
                        <Sparkles className="w-5 h-5" /> AI HIGHLIGHT SELECTION
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {highlights.map((highlight, index) => (
                            <Card
                                key={index}
                                className={`cursor-pointer transition-all border-gold/10 hover:border-gold/40 ${selectedHighlight === highlight
                                    ? 'bg-navy-light ring-2 ring-gold border-transparent shadow-glow'
                                    : 'bg-navy-light/40 hover:bg-navy-light/60'
                                    }`}
                                onClick={() => !isProcessing && handleProcessHighlight(highlight)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-black ${selectedHighlight === highlight ? 'bg-gold text-navy' : 'bg-navy text-gold'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-bold truncate mb-1 ${selectedHighlight === highlight ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                            }`}>
                                            {highlight.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-bold">
                                            <Clock className="w-3 h-3" />
                                            {secondsToTime(highlight.startTime)} - {secondsToTime(highlight.endTime)}
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed italic">
                                            "{highlight.caption}"
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Video Preview Area */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Play className="w-5 h-5 text-gold" /> 컨텐츠 미리보기
                    </h3>

                    <Card className="bg-black/40 border-gold/20 p-0 overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center">
                        {/* Background Decoration */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />

                        {processedVideoUrl ? (
                            <div className="w-full flex flex-col">
                                <div className="relative aspect-[9/16] max-h-[500px] mx-auto bg-black shadow-2xl rounded-lg overflow-hidden my-6">
                                    <video
                                        ref={videoRef}
                                        src={processedVideoUrl}
                                        controls
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute top-4 right-4 bg-navy/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gold/30">
                                        <span className="text-[10px] font-black text-gold tracking-widest uppercase">Premium Export</span>
                                    </div>
                                </div>

                                <div className="p-8 bg-navy-light/80 border-t border-gold/10">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1 space-y-3">
                                            <h4 className="text-2xl font-black text-white italic">
                                                <span className="text-gold mr-2">#</span>{selectedHighlight?.title}
                                            </h4>
                                            <div className="bg-navy-darker/50 p-4 rounded-xl border border-white/5">
                                                <p className="text-sm font-bold text-gold mb-2 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" /> 숏폼 캡션 가이드
                                                </p>
                                                <p className="text-sm text-gray-400 leading-relaxed italic">
                                                    "{selectedHighlight?.caption}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 min-w-[160px]">
                                            <Button
                                                onClick={handleDownload}
                                                className="w-full h-12 shadow-glow shadow-gold/10 font-bold"
                                            >
                                                <Download className="w-4 h-4 mr-2" /> 다운로드
                                            </Button>
                                            <Button
                                                onClick={handleShare}
                                                variant="outline"
                                                className="w-full h-12 border-gold/20 hover:bg-gold/10 text-gold font-bold"
                                            >
                                                <Share2 className="w-4 h-4 mr-2" /> 컨텐츠 공유
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-20 space-y-6">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-6">
                                            <div className="w-24 h-24 bg-gold/10 rounded-full animate-pulse border-2 border-gold/20" />
                                            <Loader2 className="w-12 h-12 text-gold animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                        <h4 className="text-xl font-bold text-white mb-2">영상을 다듬고 있습니다</h4>
                                        <p className="text-gray-500 max-w-sm mx-auto">
                                            AI가 선택한 최고의 순간을 고화질 숏폼 규격으로 변환하는 중입니다. 잠시만 기다려주세요.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center opacity-40">
                                        <Video className="w-20 h-20 text-gold mb-4" />
                                        <h4 className="text-lg font-medium text-gray-300">하이라이트를 선택해주세요</h4>
                                        <p className="text-sm text-gray-500">목록에서 편집할 구간을 선택하면 미리보기가 생성됩니다.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Rendering Progress */}
                        {isProcessing && progress && (
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-black/80 backdrop-blur-lg animate-fade-in-up">
                                <ProgressBar
                                    progress={progress.progress}
                                    label={progress.message}
                                    showPercentage
                                />
                            </div>
                        )}
                    </Card>

                    {/* Editor Tips */}
                    <Card className="p-6 bg-gradient-to-r from-navy-light/40 to-transparent border-gold/10">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center shrink-0 border border-gold/20">
                                <Sparkles className="w-5 h-5 text-gold" />
                            </div>
                            <div>
                                <h5 className="font-bold text-white mb-1">편집 팁</h5>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    에이아이멘은 시청자의 시선을 사로잡을 수 있는 9:16 세로형 규격과 워터마크를 자동으로 입혀드립니다.
                                    생성된 영상은 인스타그램 릴스, 유튜브 쇼츠, 틱톡에 바로 활용하실 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
