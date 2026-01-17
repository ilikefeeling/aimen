'use client';

import { useState } from 'react';
import { resolveVideoApiUrl } from '@/lib/api/config';

interface ClipGeneratorProps {
    highlightId: string;
    onClipGenerated?: (clip: any) => void;
}

const PLATFORMS = [
    { id: 'youtube', name: 'YouTube Shorts', resolution: '1080x1920' },
    { id: 'instagram', name: 'Instagram Reels', resolution: '1080x1920' },
    { id: 'facebook', name: 'Facebook', resolution: '1080x1080' }
];

export default function ClipGenerator({ highlightId, onClipGenerated }: ClipGeneratorProps) {
    const [selectedPlatform, setSelectedPlatform] = useState('youtube');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [clip, setClip] = useState<any>(null);
    const [error, setError] = useState('');

    const generateClip = async () => {
        try {
            setIsGenerating(true);
            setProgress(0);
            setError('');

            console.log('🎬 Generating clip:', { highlightId, selectedPlatform });

            const response = await fetch(resolveVideoApiUrl('/api/clips/generate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    highlightId,
                    platform: selectedPlatform
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate clip');
            }

            const data = await response.json();
            console.log('✅ Clip generation started:', data);

            // Poll for status
            const clipId = data.clip.id;
            pollClipStatus(clipId);

        } catch (err: any) {
            console.error('❌ Generation error:', err);
            setError(err.message || 'Failed to generate clip');
            setIsGenerating(false);
        }
    };

    const pollClipStatus = async (clipId: string) => {
        const maxAttempts = 60; // 1 minute max
        let attempts = 0;

        const interval = setInterval(async () => {
            try {
                attempts++;

                const response = await fetch(resolveVideoApiUrl(`/api/clips/${clipId}`));
                const data = await response.json();

                console.log(`📊 Polling attempt ${attempts}:`, data.clip.status);

                if (data.clip.status === 'COMPLETED') {
                    clearInterval(interval);
                    setClip(data.clip);
                    setIsGenerating(false);
                    setProgress(100);
                    onClipGenerated?.(data.clip);
                    console.log('🎉 Clip ready:', data.clip);
                } else if (data.clip.status === 'FAILED') {
                    clearInterval(interval);
                    setError('Clip generation failed');
                    setIsGenerating(false);
                } else {
                    // Update progress
                    const progressPercent = Math.min((attempts / maxAttempts) * 100, 95);
                    setProgress(progressPercent);
                }

                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setError('Clip generation timeout');
                    setIsGenerating(false);
                }

            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 2000); // Poll every 2 seconds
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4">
            <h3 className="text-lg font-semibold mb-4">🎬 클립 생성</h3>

            {/* Platform Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    플랫폼 선택
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {PLATFORMS.map((platform) => (
                        <label
                            key={platform.id}
                            className={`
                                flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                                ${selectedPlatform === platform.id
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name="platform"
                                value={platform.id}
                                checked={selectedPlatform === platform.id}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                                className="mr-3"
                                disabled={isGenerating}
                            />
                            <div className="flex-1">
                                <div className="font-medium">{platform.name}</div>
                                <div className="text-sm text-gray-500">{platform.resolution}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={generateClip}
                disabled={isGenerating}
                className={`
                    w-full py-3 px-4 rounded-lg font-semibold text-white transition-all
                    ${isGenerating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }
                `}
            >
                {isGenerating ? '생성 중...' : '클립 생성하기'}
            </button>

            {/* Progress Bar */}
            {isGenerating && (
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>진행률</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                    ❌ {error}
                </div>
            )}

            {/* Generated Clip */}
            {clip && clip.status === 'COMPLETED' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                    <h4 className="font-semibold text-green-800 mb-3">✅ 클립 생성 완료!</h4>

                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">해상도:</span>
                            <span className="font-medium">{clip.resolution}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">길이:</span>
                            <span className="font-medium">{clip.duration}초</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">파일 크기:</span>
                            <span className="font-medium">
                                {(clip.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                        </div>
                    </div>

                    <a
                        href={clip.videoUrl}
                        download
                        className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-center rounded-lg font-semibold transition-all"
                    >
                        ⬇️ 클립 다운로드
                    </a>
                </div>
            )}
        </div>
    );
}
