'use client';

import { useEffect, useState } from 'react';
import ClipGenerator from '@/components/ClipGenerator';

export default function ClipTestPage() {
    const [sermon, setSermon] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestSermon();
    }, []);

    const fetchLatestSermon = async () => {
        try {
            const response = await fetch('/api/sermons');
            const data = await response.json();

            if (data.sermons && data.sermons.length > 0) {
                const latestSermon = data.sermons[0];
                setSermon(latestSermon);
                console.log('Latest sermon:', latestSermon);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching sermons:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">로딩 중...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!sermon) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-600">분석된 영상이 없습니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    const analysisData = sermon.analysisData;
    const highlights = analysisData?.highlights || [];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">🎬 클립 생성 테스트</h1>

                {/* Sermon Info */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-2">{sermon.title}</h2>
                    <p className="text-sm text-gray-500">
                        업로드: {new Date(sermon.createdAt).toLocaleString('ko-KR')}
                    </p>
                </div>

                {/* Analysis Summary */}
                {analysisData?.summary && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="font-semibold mb-2">📝 AI 요약</h3>
                        <p className="text-gray-700">{analysisData.summary}</p>
                    </div>
                )}

                {/* Highlights with Clip Generator */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">✨ 하이라이트 ({highlights.length})</h3>

                    {highlights.map((highlight: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6">
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-lg">{index + 1}. {highlight.title}</h4>
                                    <span className="text-sm text-gray-500">
                                        {highlight.startTime}s - {highlight.endTime}s
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{highlight.caption}</p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                        {highlight.emotion}
                                    </span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                        {highlight.platform}
                                    </span>
                                </div>
                            </div>

                            {/* Clip Generator for this highlight */}
                            <ClipGenerator
                                highlightId={`temp-${index}`}
                                onClipGenerated={(clip) => {
                                    console.log('Clip generated:', clip);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
