'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { uploadVideo, pollJobStatus, JobStatus } from '@/lib/api/video';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Upload, Video, Sparkles, Scissors, CheckCircle2, AlertCircle, Loader2, FileVideo, X } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPage() {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [churchName, setChurchName] = useState('');
    const [targetLanguages, setTargetLanguages] = useState<string[]>(['korean']);
    const [dubbingTone, setDubbingTone] = useState('professional');
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    if (sessionStatus === 'loading') {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">사용자 정보를 확인 중...</p>
                </div>
            </div>
        );
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('video/')) {
            setFile(droppedFile);
            setError('');
        } else {
            setError('비디오 파일만 업로드할 수 있습니다.');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
            toast.success(`파일이 선택되었습니다: ${selectedFile.name}`);
        }
    };

    const handleUpload = async () => {
        console.log('[Upload] handleUpload triggered', { title, fileName: file?.name, userId: session?.user?.id });

        if (!file || !title) {
            toast.error('파일과 제목을 모두 입력해주세요.');
            setError('파일과 제목을 모두 입력해주세요.');
            return;
        }

        if (!session?.user?.id) {
            console.error('[Upload] Missing userId in session');
            toast.error('로그인이 필요합니다.');
            setError('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        setUploading(true);
        setError('');
        setStatus('서버로 영상 업로드 중...');
        setUploadProgress(10);

        const toastId = toast.loading('영상을 업로드하고 있습니다...');

        try {
            console.log('[Upload] Calling uploadVideo API...');
            const result = await uploadVideo(file, title, session.user.id, targetLanguages, dubbingTone);
            console.log('[Upload] uploadVideo success, jobId:', result.jobId);

            setUploadProgress(30);
            setStatus('AI 분석 작업 대기 중...');
            toast.loading('AI가 설교 영상을 분석하고 하이라이트를 추출하고 있습니다...', { id: toastId });

            await pollJobStatus(
                result.jobId,
                (jobStatus: JobStatus) => {
                    // Handle both numeric and object progress formats
                    const progressValue = typeof jobStatus.progress === 'object'
                        ? (jobStatus.progress as any).progress
                        : jobStatus.progress;

                    const currentStep = typeof jobStatus.progress === 'object'
                        ? (jobStatus.progress as any).currentStep
                        : null;

                    const calculatedProgress = 30 + (progressValue * 0.7);
                    setUploadProgress(calculatedProgress);

                    const statusMsg = currentStep
                        ? `${currentStep} (${Math.round(progressValue)}%)`
                        : `AI 분석 및 하이라이트 추출 중... ${Math.round(progressValue)}%`;

                    setStatus(statusMsg);
                    toast.loading(statusMsg, { id: toastId });
                }
            );

            setUploadProgress(100);
            setStatus('분석 완료! 이동 중...');
            toast.success('분석이 성공적으로 완료되었습니다!', { id: toastId });

            setTimeout(() => {
                router.push('/dashboard/videos');
            }, 1500);

        } catch (err) {
            console.error('[Upload] Upload process failed:', err);
            const errorMsg = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.';
            setError(errorMsg);
            setStatus('');
            toast.error(errorMsg, { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-16 animate-fade-in relative">
            {/* Divine Aura Background */}
            <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="text-center space-y-6 relative">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-panel border-gold/20 text-gold text-xs font-black tracking-[0.2em] uppercase animate-glimmer">
                    <Sparkles className="w-4 h-4" />
                    Divine AI Analysis
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-widest uppercase font-cinzel">
                    Upload <span className="text-gold-gradient">Sermon</span>
                </h1>
                <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
                    주일의 은혜를 평일의 일상으로. <br />
                    AI가 포착한 핵심 정수로 성도들의 마음을 움직이는 숏폼을 만드세요.
                </p>
            </div>

            {/* Language Selection Area */}
            <div className="flex flex-col items-center gap-6 py-8">
                <div className="text-gold/60 text-xs font-black uppercase tracking-[0.2em] mb-2">
                    Target Languages <span className="text-gray-500 text-[13px] lowercase tracking-normal">(중복 선택 가능)</span>
                </div>
                {/* Feature Intro Message */}
                <div className="glass-panel px-8 py-4 rounded-3xl border border-gold/20 bg-gold/5 flex items-center gap-4 mb-6 animate-slide-up max-w-2xl">
                    <Sparkles className="w-6 h-6 text-gold animate-pulse" />
                    <p className="text-gray-300 text-sm font-bold leading-relaxed">
                        <span className="text-gold">AI 음성 더빙 + 자막 동시 생성:</span><br />
                        선택하신 모든 언어에 대해 목소리 변환과 번역 자막이 동시에 처리됩니다.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    {[
                        { id: 'english', name: 'English', flag: '🇺🇸' },
                        { id: 'japanese', name: '日本語', flag: '🇯🇵' },
                        { id: 'chinese', name: '简体中文', flag: '🇨🇳' },
                        { id: 'vietnamese', name: 'Tiếng Việt', flag: '🇻🇳' },
                    ].map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => {
                                setTargetLanguages(prev => {
                                    if (prev.includes(lang.id)) {
                                        return prev.filter(id => id !== lang.id);
                                    } else {
                                        return [...prev, lang.id];
                                    }
                                });
                            }}
                            className={`
                                px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all duration-300
                                ${targetLanguages.includes(lang.id)
                                    ? 'bg-gold text-navy shadow-gold/20 shadow-xl scale-110 border-gold'
                                    : 'glass-panel border-white/5 text-gray-400 hover:border-gold/30 hover:text-white'
                                }
                            `}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            {lang.name}
                        </button>
                    ))}
                    <div className="text-gray-500 text-[11px] font-bold">
                        ※ 원본(한국어) 하이라이트는 기본적으로 항상 생성됩니다.
                    </div>

                    {targetLanguages.length > 0 && (
                        <div className="animate-slide-up bg-white/5 p-4 rounded-3xl border border-gold/20 flex items-center gap-4">
                            <span className="text-gold text-xs font-black uppercase tracking-widest ml-2">Dubbing Tone:</span>
                            {[
                                { id: 'professional', name: 'Professional' },
                                { id: 'calm', name: 'Calm' },
                                { id: 'energetic', name: 'Energetic' },
                            ].map((tone) => (
                                <button
                                    key={tone.id}
                                    onClick={() => setDubbingTone(tone.id)}
                                    className={`
                                    px-4 py-2 rounded-xl text-xs font-bold transition-all
                                    ${dubbingTone === tone.id ? 'bg-gold/20 text-gold border border-gold/50' : 'text-gray-500 hover:text-gray-300'}
                                `}
                                >
                                    {tone.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload Core Area */}
                <div className="glass-card rounded-[3.5rem] p-10 md:p-16 border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gold/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    {/* Drag & Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                        border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all duration-700 relative overflow-hidden
                        ${isDragging
                                ? 'border-gold bg-gold/10 scale-[1.02] shadow-gold/20 shadow-2xl'
                                : 'border-white/10 hover:border-gold/30 hover:bg-white/[0.02]'
                            }
                        ${file ? 'bg-gold/5 border-gold/40' : ''}
                    `}
                    >
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-input"
                            disabled={uploading}
                        />

                        {!file ? (
                            <div className="space-y-8">
                                <div className="w-28 h-28 bg-gradient-gold rounded-3xl flex items-center justify-center mx-auto shadow-gold-lg animate-bounce-slow transform -rotate-3">
                                    <Upload className="w-12 h-12 text-navy stroke-[2.5]" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black text-white tracking-tight">
                                        성전의 문을 여세요
                                    </h2>
                                    <p className="text-gray-500 font-medium text-lg">
                                        영상을 드래그하거나 아래 버튼을 클릭하여 선택하세요
                                    </p>
                                </div>
                                <label
                                    htmlFor="file-input"
                                    className="inline-block glass-panel border-gold/30 text-gold px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold hover:text-navy transition-all duration-500 cursor-pointer"
                                >
                                    성전 파일 탐색
                                </label>
                                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest pt-4">
                                    MP4, MOV, AVI (Max 500MB)
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-fade-in">
                                <div className="w-28 h-28 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto border border-green-500/30 shadow-2xl">
                                    <FileVideo className="w-12 h-12 text-green-400" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white line-clamp-1 px-4">
                                        {file.name}
                                    </h2>
                                    <p className="text-gold font-bold uppercase tracking-widest text-sm">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB • READY FOR BLESSING
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="px-6 py-2 rounded-full bg-red-500/10 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                    disabled={uploading}
                                >
                                    파일 변경하기
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Form Styling */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-xs font-black text-gold/60 uppercase tracking-[0.2em] ml-2">
                                Sermon Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="주일 대예배 - 부활의 소망"
                                className="w-full glass-panel border-white/5 bg-white/[0.02] rounded-3xl px-8 py-6 text-white text-lg font-bold placeholder:text-gray-700 focus:outline-none focus:border-gold/50 transition-all shadow-inner"
                                disabled={uploading}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black text-gold/60 uppercase tracking-[0.2em] ml-2">
                                Church / Ministry
                            </label>
                            <input
                                type="text"
                                value={churchName}
                                onChange={(e) => setChurchName(e.target.value)}
                                placeholder="에이아이멘 교회"
                                className="w-full glass-panel border-white/5 bg-white/[0.02] rounded-3xl px-8 py-6 text-white text-lg font-bold placeholder:text-gray-700 focus:outline-none focus:border-gold/50 transition-all shadow-inner"
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    {/* Progress UI */}
                    {uploading && (
                        <div className="mt-16 space-y-6 animate-fade-in">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-gold font-black uppercase tracking-widest text-xs animate-pulse">
                                    {status}
                                </span>
                                <span className="text-white font-black text-2xl font-cinzel">
                                    {Math.round(uploadProgress)}%
                                </span>
                            </div>
                            <div className="h-4 w-full bg-navy-darker rounded-full overflow-hidden border border-white/5 p-1">
                                <div
                                    className="h-full bg-gradient-gold rounded-full transition-all duration-500 relative"
                                    style={{ width: `${uploadProgress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && (
                        <div className="mt-10 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 flex items-center gap-4 animate-glow-pulse">
                            <AlertCircle className="w-6 h-6" />
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    {/* Ultimate Action Button */}
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || !title || uploading}
                        className={`
                        w-full mt-16 py-8 rounded-3xl font-black text-xl uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-4 relative z-50
                        ${!file || !title || uploading
                                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                : 'bg-[#FEE500] text-[#3C1E1E] shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer'
                            }
                    `}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-8 h-8 animate-spin" />
                                AI 분석 진행 중...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-7 h-7" />
                                AI 영상 분석 시작하기
                            </>
                        )}
                    </button>
                </div>

                {/* Premium Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                    {[
                        { icon: Sparkles, title: "Celestial Logic", desc: "Gemini 2.5 Flash 기반의 AI가 설교의 영적 핵심을 초고속으로 통찰합니다." },
                        { icon: CheckCircle2, title: "Sacred Captions", desc: "은혜로운 자막과 SNS 맞춤형 해시태그를 성령의 영감처럼 완벽하게 생성합니다." },
                        { icon: Scissors, title: "Global Reach", desc: "Shorts, Reels, TikTok 등 모든 열방의 플랫폼에 최적화된 규격으로 편집합니다." }
                    ].map((item, i) => (
                        <div key={i} className="glass-panel p-10 rounded-[2.5rem] border-white/5 flex flex-col items-center text-center space-y-5 hover:border-gold/20 transition-all group">
                            <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20 group-hover:rotate-12 transition-transform shadow-divine">
                                <item.icon className="w-8 h-8 text-gold" />
                            </div>
                            <h3 className="text-xl font-black text-white font-cinzel tracking-widest uppercase">{item.title}</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
