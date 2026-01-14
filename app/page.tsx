'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Upload, Zap, DollarSign, Sparkles, Video, Grid3x3, Check, Settings } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);

  // Hydration 오류(removeChild) 방지를 위한 마운트 체크
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      router.push('/dashboard/upload');
    }
  };

  // 마운트 전에는 빈 레이아웃(또는 최소한의 서버 렌더링 결과) 반환
  if (!mounted) {
    return <div className="min-h-screen bg-navy-darker" />;
  }

  return (
    <div className="min-h-screen bg-navy-darker">
      {/* Header */}
      <nav className="bg-navy-light/30 border-b border-gold/10 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-navy font-bold text-xl">AI</span>
              </div>
              <span className="text-white font-bold text-2xl">men</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Admin Dashboard Button */}
              {session?.user && (session.user as any).role === 'ADMIN' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-gold/20 hover:bg-gold/30 text-gold border border-gold/50 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  관리자
                </button>
              )}
              {status === 'authenticated' ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gold hover:bg-gold-light text-navy px-6 py-2 rounded-lg font-semibold transition-all shadow-md"
                >
                  대시보드
                </button>
              ) : (
                <button
                  onClick={() => signIn('kakao')}
                  className="bg-yellow-bright hover:bg-gold-light text-navy px-6 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  체험
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* ... rest of the file ... */}

      {/* Hero Section - Card Style */}
      <section className="relative overflow-hidden py-6">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-navy-light/50 border border-gold/20 rounded-2xl p-12 backdrop-blur-lg shadow-card-deep hover:shadow-card-hover hover:border-gold/40 transition-all duration-300">
            {/* Free Trial Badge */}
            <div className="mb-8 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/50 px-6 py-3 rounded-full animate-fade-in">
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-bold text-lg">첫 3개 영상 완전 무료</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              <span className="text-white">목사님, 설교만 하세요.</span>
              <br />
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                SNS 사역은 AI-men이 합니다.
              </span>
            </h1>

            <p className="text-xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              업로드 한 번이면 알고리즘 최적화, 가독성 높은 자막,
              <br />
              AI와 함께하는 가장 스마트한 미디어 사역의 시작.
            </p>

            {/* Value Icons */}
            <div className="flex justify-center gap-12 mb-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center shadow-glow animate-glow-pulse">
                  <Zap className="w-8 h-8 text-gold" />
                </div>
                <span className="text-gold font-semibold">간편한</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center shadow-glow animate-glow-pulse" style={{ animationDelay: '0.5s' }}>
                  <DollarSign className="w-8 h-8 text-gold" />
                </div>
                <span className="text-gold font-semibold">저렴한</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center shadow-glow animate-glow-pulse" style={{ animationDelay: '1s' }}>
                  <Sparkles className="w-8 h-8 text-gold" />
                </div>
                <span className="text-gold font-semibold">전문성</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => signIn('kakao')}
                className="bg-yellow-bright hover:bg-gold-light text-navy px-16 py-5 rounded-lg font-bold text-xl shadow-gold hover:shadow-gold-lg transform hover:scale-110 transition-all duration-200 animate-pulse-subtle"
              >
                카카오로 3초만에 시작하기
              </button>
              <p className="text-gray-400 text-sm">✓ 신용카드 불필요 · ✓ 언제든 취소 가능</p>
            </div>

            {/* Step Icons - Inside Hero Card */}
            <div className="flex justify-center gap-20 mt-12 pt-8 border-t border-gold/10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-navy-light border border-gold/30 flex items-center justify-center">
                  <Video className="w-7 h-7 text-gold" />
                </div>
                <span className="text-gray-300 text-xs">영상 업로드</span>
                <span className="text-gold text-xs font-semibold">Step 1</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-navy-light border border-gold/30 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-gold" />
                </div>
                <span className="text-gray-300 text-xs">AI 분석</span>
                <span className="text-gold text-xs font-semibold">Step 2</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-navy-light border border-gold/30 flex items-center justify-center">
                  <Grid3x3 className="w-7 h-7 text-gold" />
                </div>
                <span className="text-gray-300 text-xs">콘텐츠 생성</span>
                <span className="text-gold text-xs font-semibold">Step 3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Area - Card Style */}
      <section className="py-6 container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-navy-light/50 border border-gold/20 rounded-2xl p-8 backdrop-blur-lg shadow-card-deep hover:shadow-card-hover hover:border-gold/40 transition-all duration-300">
            <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">영상 업로드</h2>
            <input
              type="file"
              accept="video/*"
              id="video-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="video-upload"
              className="block border-2 border-dashed border-gold/40 rounded-2xl p-16 bg-navy-lighter/30 hover:border-gold hover:bg-gold/5 hover:scale-[1.02] transition-all duration-300 cursor-pointer backdrop-blur-glass group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
                  <Upload className="w-12 h-12 text-gold animate-bounce-slow" />
                </div>
                <p className="text-gold text-2xl font-bold">클릭하거나 드래그하세요</p>
                <p className="text-gray-100 text-lg">설교 영상을 업로드하면 AI가 자동으로 분석합니다 ✨</p>
                <div className="flex gap-4 text-gray-400 text-sm">
                  <span>✓ MP4, MOV, AVI 지원</span>
                  <span>·</span>
                  <span>✓ 최대 500MB</span>
                  <span>·</span>
                  <span>✓ 최대 2시간</span>
                </div>
                {selectedFile && (
                  <p className="text-green-400 font-semibold mt-2">
                    ✓ {selectedFile.name} 선택됨
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* 3-Step Process Detail - Card Style */}
      <section className="py-6 container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-navy-light/50 border border-gold/20 rounded-2xl p-8 backdrop-blur-lg shadow-card-deep hover:shadow-card-hover hover:border-gold/40 transition-all duration-300">
            <h3 className="text-3xl font-bold text-center mb-12 tracking-tight">
              <span className="bg-gradient-gold bg-clip-text text-transparent">3단계로 완성되는 미디어 사역</span>
            </h3>

            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {/* Step 1 */}
              <Card hover className="bg-navy-light/50 border border-gold/10 backdrop-blur-glass hover:-translate-y-2 transition-all duration-300">
                <div className="flex flex-col items-center text-center p-8">
                  <div className="w-20 h-20 mb-6 rounded-full bg-gold/10 flex items-center justify-center shadow-glow">
                    <Video className="w-10 h-10 text-gold" />
                  </div>
                  <div className="inline-block bg-gold text-navy px-3 py-1 rounded-full text-xs font-bold mb-3">
                    Step 1
                  </div>
                  <h4 className="text-3xl font-bold text-gold mb-3">영상 업로드</h4>
                  <p className="text-yellow-bright font-semibold mb-4">⏱️ 약 30초</p>
                  <p className="text-gray-100 text-sm leading-relaxed mb-4">
                    설교 영상 파일을 업로드합니다
                  </p>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>✓ MP4, MOV, AVI 모두 지원</li>
                    <li>✓ 최대 2시간 길이까지</li>
                  </ul>
                </div>
              </Card>

              {/* Step 2 */}
              <Card hover className="bg-navy-light/50 border border-gold/10 backdrop-blur-glass hover:-translate-y-2 transition-all duration-300">
                <div className="flex flex-col items-center text-center p-8">
                  <div className="w-20 h-20 mb-6 rounded-full bg-gold/10 flex items-center justify-center shadow-glow">
                    <Sparkles className="w-10 h-10 text-gold" />
                  </div>
                  <div className="inline-block bg-gold text-navy px-3 py-1 rounded-full text-xs font-bold mb-3">
                    Step 2
                  </div>
                  <h4 className="text-3xl font-bold text-gold mb-3">AI 하이라이트 추출</h4>
                  <p className="text-yellow-bright font-semibold mb-4">⏱️ 2-3분</p>
                  <p className="text-gray-100 text-sm leading-relaxed mb-4">
                    AI가 3-5개 핵심 구간을 자동 추출
                  </p>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>✓ 최적 캡션 자동 생성</li>
                    <li>✓ 감동 포인트 정확히 식별</li>
                  </ul>
                </div>
              </Card>

              {/* Step 3 */}
              <Card hover className="bg-navy-light/50 border border-gold/10 backdrop-blur-glass hover:-translate-y-2 transition-all duration-300">
                <div className="flex flex-col items-center text-center p-8">
                  <div className="w-20 h-20 mb-6 rounded-full bg-gold/10 flex items-center justify-center shadow-glow">
                    <Grid3x3 className="w-10 h-10 text-gold" />
                  </div>
                  <div className="inline-block bg-gold text-navy px-3 py-1 rounded-full text-xs font-bold mb-3">
                    Step 3
                  </div>
                  <h4 className="text-3xl font-bold text-gold mb-3">SNS 맞춤 포맷</h4>
                  <p className="text-yellow-bright font-semibold mb-4">⏱️ 즉시 다운로드</p>
                  <p className="text-gray-100 text-sm leading-relaxed mb-4">
                    YouTube, Instagram, Facebook 포맷으로 다운로드
                  </p>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>✓ 9:16, 16:9, 1:1 비율 자동</li>
                    <li>✓ 자막 포함 완성본</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Card Style */}
      <section className="py-6 container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-navy-light/50 border border-gold/20 rounded-2xl p-12 backdrop-blur-lg shadow-card-deep hover:shadow-card-hover hover:border-gold/40 transition-all duration-300">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-white mb-6 tracking-tight">
                지금 바로 시작하세요
              </h3>
              <p className="text-gray-100 text-xl mb-8 leading-relaxed">
                설교 영상 편집 시간을 90% 단축하고 복음의 전파력을 극대화하세요
              </p>
              <button
                onClick={() => signIn('kakao')}
                className="bg-yellow-bright hover:bg-gold-light text-navy px-16 py-5 rounded-lg font-bold text-xl shadow-gold hover:shadow-gold-lg transform hover:scale-110 transition-all duration-200"
              >
                카카오로 무료 시작하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-light py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2026 aimen (에이아이멘). All rights reserved.</p>
          <p className="mt-2 text-sm text-gold">주일의 은혜를 평일의 일상으로</p>
        </div>
      </footer>
    </div>
  );
}
