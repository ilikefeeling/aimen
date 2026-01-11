'use client';

import React, { useState, useRef } from 'react';
import { Highlight } from '@/types';
import { processHighlight, getVideoDuration, EditProgress } from '@/lib/ffmpeg/editor';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';

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
        setProgress({ stage: 'loading', progress: 0, message: 'Starting...' });
        setProcessedVideoUrl(null);

        try {
            const blob = await processHighlight(
                videoFile,
                {
                    startTime: highlight.start_time,
                    endTime: highlight.end_time,
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
                // Fallback to copying caption
                await navigator.clipboard.writeText(selectedHighlight.caption);
                alert('캡션이 클립보드에 복사되었습니다!');
            }
        } else {
            // Fallback for browsers that don't support sharing
            await navigator.clipboard.writeText(selectedHighlight.caption);
            alert('캡션이 클립보드에 복사되었습니다!');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8">
            <h2 className="text-3xl font-bold text-gold mb-8">하이라이트 편집</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Highlights List */}
                <div className="lg:col-span-1">
                    <h3 className="text-xl font-semibold text-gold mb-4">AI 추출 하이라이트</h3>
                    <div className="space-y-4">
                        {highlights.map((highlight, index) => (
                            <Card
                                key={index}
                                hover
                                className={`cursor-pointer ${selectedHighlight === highlight ? 'border-gold border-2' : ''
                                    }`}
                                onClick={() => !isProcessing && handleProcessHighlight(highlight)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gold mb-2">{highlight.title}</h4>
                                        <p className="text-sm text-gray-400 mb-2">
                                            {highlight.start_time} - {highlight.end_time}
                                        </p>
                                        <p className="text-sm text-gray-300 line-clamp-2">{highlight.caption}</p>
                                    </div>
                                    <div className="text-2xl ml-2">🎬</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Video Preview */}
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="text-xl font-semibold text-gold mb-4">미리보기</h3>

                        {processedVideoUrl ? (
                            <div className="space-y-4">
                                <video
                                    ref={videoRef}
                                    src={processedVideoUrl}
                                    controls
                                    className="w-full rounded-lg"
                                    style={{ maxHeight: '500px' }}
                                />

                                <div className="bg-navy-lighter p-4 rounded-lg">
                                    <h4 className="font-semibold text-gold mb-2">{selectedHighlight?.title}</h4>
                                    <p className="text-sm text-gray-300 mb-3">{selectedHighlight?.caption}</p>
                                    <div className="bg-navy p-3 rounded text-xs text-gray-400">
                                        <p className="font-semibold mb-1">메신저 공유용 요약:</p>
                                        <p className="whitespace-pre-line">{selectedHighlight?.summary}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button onClick={handleDownload} className="flex-1">
                                        📥 다운로드
                                    </Button>
                                    <Button onClick={handleShare} variant="secondary" className="flex-1">
                                        📤 공유하기
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 bg-navy-lighter rounded-lg">
                                <p className="text-gray-400">
                                    {isProcessing ? '영상 처리 중...' : '하이라이트를 선택하여 편집하세요'}
                                </p>
                            </div>
                        )}

                        {/* Progress Bar */}
                        {isProcessing && progress && (
                            <div className="mt-6">
                                <ProgressBar
                                    progress={progress.progress}
                                    label={progress.message}
                                    showPercentage
                                />
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
