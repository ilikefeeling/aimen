'use client';

import { useState } from 'react';
import { uploadVideo, pollJobStatus } from '@/lib/api/video';
import { useRouter } from 'next/navigation';

export default function TestUploadPage() {
    const router = useRouter();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState('');

    const handleUpload = async () => {
        if (!videoFile) {
            alert('영상 파일을 선택해주세요');
            return;
        }

        if (!title) {
            alert('제목을 입력해주세요');
            return;
        }

        setIsUploading(true);
        setProgress(0);
        setStatus('업로드 시작...');

        try {
            console.log('🎬 Starting upload...');
            setStatus('📤 Uploading to Video API...');

            const { jobId, videoId, url } = await uploadVideo(
                videoFile,
                title,
                'test-user-123' // 임시 사용자 ID
            );

            console.log('✅ Upload successful!');
            console.log('  - Video ID:', videoId);
            console.log('  - Job ID:', jobId);
            console.log('  - URL:', url);

            setProgress(10);
            setStatus('⏳ AI 분석 중...');

            await pollJobStatus(jobId, (jobStatus) => {
                console.log(`📊 Progress: ${jobStatus.progress}% (${jobStatus.status})`);
                setProgress(jobStatus.progress);
                setStatus(`분석 중... ${jobStatus.progress}%`);
            });

            console.log('🎉 Analysis complete!');
            setStatus('✅ 완료!');

            alert(`분석 완료!\nVideo ID: ${videoId}`);

            // Editor로 이동 (나중에)
            // router.push(`/editor/${videoId}`);

        } catch (error: any) {
            console.error('❌ Error:', error);
            setStatus(`❌ 오류: ${error.message}`);
            alert(`오류 발생:\n${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
                <h1 className="text-3xl font-bold mb-2">🧪 Video Upload Test</h1>
                <p className="text-gray-600 mb-6">로그인 없이 영상 업로드 기능 테스트</p>

                <div className="space-y-4">
                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            영상 파일 선택
                        </label>
                        <input
                            type="file"
                            accept="video/mp4,video/mov,video/avi"
                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                            disabled={isUploading}
                            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
                        />
                        {videoFile && (
                            <p className="text-sm text-gray-500 mt-1">
                                선택됨: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                    </div>

                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            영상 제목
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 테스트 영상 1"
                            disabled={isUploading}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md
                shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
                disabled:opacity-50 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                        <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>{status}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !videoFile || !title}
                        className={`w-full py-3 px-4 rounded-md font-semibold text-white
              transition-colors ${isUploading || !videoFile || !title
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isUploading ? `업로드 중... ${progress}%` : '🚀 업로드 시작'}
                    </button>
                </div>

                {/* Instructions */}
                <div className="mt-8 p-4 bg-blue-50 rounded-md">
                    <h3 className="font-semibold text-blue-900 mb-2">📝 테스트 방법</h3>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>10-50MB 크기의 테스트 영상 선택</li>
                        <li>제목 입력</li>
                        <li>"업로드 시작" 클릭</li>
                        <li>F12 → Console에서 로그 확인</li>
                        <li>진행률 모니터링</li>
                    </ol>
                </div>

                {/* System Status */}
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-semibold text-gray-900 mb-2">🔧 시스템 상태</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                        <div>✅ Redis: localhost:6379</div>
                        <div>✅ Video API: localhost:3001</div>
                        <div>✅ Worker: Running</div>
                        <div>⚡ Frontend: localhost:3000</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
