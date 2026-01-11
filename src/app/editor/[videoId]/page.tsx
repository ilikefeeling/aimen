'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { VideoEditor } from '@/components/VideoEditor';
import { Highlight } from '@/types';

export default function EditorPage() {
    const params = useParams();
    const videoId = params.videoId as string;
    const [video, setVideo] = useState<any>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchVideo();
    }, [videoId]);

    const fetchVideo = async () => {
        try {
            const response = await fetch(`/api/analyze?videoId=${videoId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch video');
            }

            const data = await response.json();
            setVideo(data);

            // For demo purposes, we'll ask user to re-upload the video file
            // In production, you'd retrieve it from storage
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="text-gold text-xl">로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="text-red-400 text-xl">오류: {error}</div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="text-gray-400 text-xl">비디오를 찾을 수 없습니다</div>
            </div>
        );
    }

    if (video.analysisStatus === 'processing') {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <div className="text-gold text-xl">AI 분석 진행 중...</div>
                    <p className="text-gray-400 mt-2">잠시만 기다려주세요</p>
                </div>
            </div>
        );
    }

    if (video.analysisStatus === 'failed') {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <div className="text-red-400 text-xl">분석 실패</div>
                    <p className="text-gray-400 mt-2">{video.analysisError || '다시 시도해주세요'}</p>
                </div>
            </div>
        );
    }

    const highlights = video.highlights as Highlight[];

    if (!videoFile) {
        return (
            <div className="min-h-screen bg-navy">
                <div className="container mx-auto px-6 py-12">
                    <h1 className="text-3xl font-bold text-gold mb-4">{video.title}</h1>
                    <div className="bg-navy-light rounded-xl p-8 max-w-2xl mx-auto">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">📹</div>
                            <h2 className="text-2xl font-bold text-gold mb-2">영상 파일 업로드</h2>
                            <p className="text-gray-400">
                                편집을 시작하려면 원본 영상 파일을 다시 업로드해주세요
                            </p>
                        </div>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileUpload}
                            className="w-full bg-navy border border-gold/30 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold file:text-navy file:cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy">
            <nav className="bg-navy-light border-b border-gold/20 mb-8">
                <div className="container mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold text-gold">{video.title}</h1>
                </div>
            </nav>

            <VideoEditor videoFile={videoFile} highlights={highlights} />
        </div>
    );
}
