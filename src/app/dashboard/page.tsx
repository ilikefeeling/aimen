'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [transcript, setTranscript] = useState('');
    const [title, setTitle] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);

    if (status === 'loading') {
        return <div className="min-h-screen bg-navy flex items-center justify-center">
            <div className="text-gold">로딩 중...</div>
        </div>;
    }

    if (status === 'unauthenticated') {
        router.push('/');
        return null;
    }

    // Check approval status
    if (session?.user.approvalStatus === 'pending') {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center p-6">
                <Card className="max-w-md text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h2 className="text-2xl font-bold text-gold mb-4">승인 대기 중</h2>
                    <p className="text-gray-300">
                        관리자 승인을 기다리고 있습니다.
                        <br />
                        승인되면 이메일로 알려드리겠습니다.
                    </p>
                </Card>
            </div>
        );
    }

    if (session?.user.approvalStatus === 'rejected') {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center p-6">
                <Card className="max-w-md text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gold mb-4">승인 거부됨</h2>
                    <p className="text-gray-300">
                        관리자에 의해 승인이 거부되었습니다.
                        <br />
                        문의사항은 support@aimen.com으로 연락주세요.
                    </p>
                </Card>
            </div>
        );
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!videoFile) {
            alert('영상 파일을 선택해주세요.');
            return;
        }

        if (!title) {
            alert('제목을 입력해주세요.');
            return;
        }

        setIsAnalyzing(true);
        setProgress(0);

        try {
            console.log('🎬 Starting video upload...');

            // Import video API dynamically
            const { uploadVideo, pollJobStatus } = await import('@/lib/api/video');

            // 1. Upload video to processing server
            console.log('📤 Uploading to video API...');
            const { jobId, videoId, url } = await uploadVideo(
                videoFile,
                title,
                session.user.id
                // session.accessToken // TODO: Add JWT token
            );

            console.log('✅ Upload successful!');
            console.log('  - Video ID:', videoId);
            console.log('  - Job ID:', jobId);
            console.log('  - URL:', url);

            setProgress(10);

            // 2. Poll job status
            console.log('⏳ Waiting for AI analysis...');
            await pollJobStatus(jobId, (status) => {
                console.log(`📊 Progress: ${status.progress}% (${status.status})`);
                setProgress(status.progress);

                if (status.status === 'completed') {
                    console.log('🎉 Analysis complete!');
                }
            });

            // 3. Redirect to editor
            console.log('🎬 Redirecting to editor...');
            router.push(`/editor/${videoId}`);

        } catch (error: any) {
            console.error('❌ Analysis error:', error);
            alert(`분석 중 오류가 발생했습니다:\n${error.message}`);
        } finally {
            setIsAnalyzing(false);
            setProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-navy">
            <nav className="bg-navy-light border-b border-gold/20">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gold">대시보드</h1>
                    <div className="flex items-center gap-3">
                        {session?.user?.role === 'admin' && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="bg-gold/20 hover:bg-gold/30 text-gold border border-gold/50 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                관리자
                            </button>
                        )}
                        <span className="text-gray-300">{session?.user?.email}</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${session.user.subscriptionStatus === 'pro'
                            ? 'bg-gold text-navy'
                            : 'bg-navy-lighter text-gray-400'
                            }`}>
                            {session.user.subscriptionStatus.toUpperCase()}
                        </span>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-12">
                <h2 className="text-4xl font-bold text-gold mb-8">대시보드</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <Card>
                        <h3 className="text-2xl font-bold text-gold mb-6">새 설교 분석</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gold mb-2">
                                    제목
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="예: 2024년 신년 메시지"
                                    className="w-full bg-navy-lighter border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gold mb-2">
                                    영상 파일 (선택)
                                </label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="w-full bg-navy-lighter border border-gold/30 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold file:text-navy file:cursor-pointer"
                                />
                                {videoFile && (
                                    <p className="text-sm text-gray-400 mt-2">
                                        선택된 파일: {videoFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gold/20" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-navy-light text-gray-400">또는</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gold mb-2">
                                    스크립트 직접 입력
                                </label>
                                <textarea
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    placeholder="설교 원고를 여기에 붙여넣으세요..."
                                    rows={8}
                                    className="w-full bg-navy-lighter border border-gold/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold"
                                />
                            </div>

                            {isAnalyzing && (
                                <ProgressBar progress={progress} label="AI 분석 중..." showPercentage />
                            )}

                            <Button
                                onClick={handleAnalyze}
                                isLoading={isAnalyzing}
                                className="w-full"
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? '분석 중...' : '🤖 AI 분석 시작'}
                            </Button>
                        </div>
                    </Card>

                    {/* Stats Section */}
                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-xl font-bold text-gold mb-4">내 구독</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">현재 플랜</span>
                                    <span className="font-bold text-gold">
                                        {session.user.subscriptionStatus.toUpperCase()}
                                    </span>
                                </div>
                                {session.user.subscriptionStatus === 'free' && (
                                    <Button variant="outline" className="w-full mt-4">
                                        Pro로 업그레이드
                                    </Button>
                                )}
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-xl font-bold text-gold mb-4">사용 가이드</h3>
                            <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                                <li>설교 제목을 입력하세요</li>
                                <li>영상 파일을 업로드하거나 스크립트를 입력하세요</li>
                                <li>AI 분석이 완료되면 편집 페이지로 이동합니다</li>
                                <li>하이라이트를 선택하고 편집하세요</li>
                                <li>다운로드하거나 SNS에 공유하세요</li>
                            </ol>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
