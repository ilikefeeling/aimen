'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Upload,
  Zap,
  DollarSign,
  Sparkles,
  Video,
  Grid3x3,
  Check,
  Settings,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  Scissors,
  Globe,
  Languages
} from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      router.push('/dashboard/upload');
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-navy-darker flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-navy-darker text-divine-white font-inter selection:bg-gold/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-navy-darker/50 backdrop-blur-xl border-b border-gold/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shadow-divine group-hover:scale-110 transition-transform p-1.5 border border-white/10">
              <img src="/logo.png" alt="aimen logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tighter">AI<span className="text-gold">-men</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-gold transition-colors">주요 기능</a>
            <a href="#process" className="hover:text-gold transition-colors">이용 가이드</a>
            <a href="#pricing" className="hover:text-gold transition-colors">요금제</a>
          </div>

          <div className="flex items-center gap-4">
            {session?.user && (session.user as any).role === 'ADMIN' && (
              <button
                onClick={() => router.push('/admin')}
                className="hidden sm:flex bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 px-4 py-2 rounded-full font-bold text-xs transition-all items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5" />
                관리자 콘솔
              </button>
            )}
            {status === 'authenticated' ? (
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-gold hover:bg-gold-light text-navy px-6 py-2 rounded-full font-bold shadow-divine hover:scale-105 transition-all text-sm"
              >
                내 대시보드
              </Button>
            ) : (
              <Button
                onClick={() => signIn('kakao')}
                className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] px-6 py-2 rounded-full font-bold shadow-divine hover:scale-105 transition-all text-sm"
              >
                무료 체험하기
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-divine-light">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-navy-lighter/20 rounded-full blur-[120px] animate-glow-pulse" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-4 py-2 rounded-full mb-8 animate-fade-in shadow-glow">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-gold text-[10px] font-black tracking-widest uppercase">Next Generation Ministry Engine</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tight animate-fade-in leading-[1.1]">
            <span className="text-white">목사님, 설교만 하세요.</span>
            <br />
            <span className="text-gold-gradient drop-shadow-sm">사역은 AI가 합니다.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            주일의 60분 은혜를 평일의 1분 숏츠로 전하세요.<br className="hidden md:block" />
            AI-men은 설교 영상을 분석하여 최적의 하이라이트를 생성합니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => signIn('kakao')}
              className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] px-12 py-6 rounded-2xl font-black text-xl shadow-divine transform hover:scale-110 active:scale-95 transition-all duration-300 flex items-center gap-3 group"
            >
              카카오로 시작하기
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/5 hover:bg-white/10 text-white px-12 py-6 rounded-2xl font-bold text-xl backdrop-blur-md border border-white/10 transition-all"
            >
              더 알아보기
            </button>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in opacity-40 group hover:opacity-100 transition-opacity" style={{ animationDelay: '0.6s' }}>
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-black text-white">90%</span>
              <span className="text-[10px] text-gold uppercase font-bold tracking-wider">편집 시간 단축</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-black text-white">5x</span>
              <span className="text-[10px] text-gold uppercase font-bold tracking-wider">SNS 도달률 향상</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-black text-white">100%</span>
              <span className="text-[10px] text-gold uppercase font-bold tracking-wider">사역 집중도 강화</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-black text-white">0원</span>
              <span className="text-[10px] text-gold uppercase font-bold tracking-wider">초기 도입 비용</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section - Pain Points */}
      <section className="py-32 bg-navy-darker relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-divine-title text-4xl md:text-5xl mb-6">The Real Problem</h2>
            <p className="text-gold font-bold uppercase tracking-[0.3em] text-xs">사역의 발목을 잡는 '편집'이라는 장벽</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="bg-gradient-to-br from-red-500/5 to-transparent p-10 rounded-[2.5rem] border border-red-500/10 glass-panel hover:border-red-500/30 transition-all duration-500 group">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">
                  끝이 없는 편집 시간
                </h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  1시간의 설교 영상을 1분짜리 쇼츠로 만들기 위해, 미디어 팀은 밤을 지새우며 수백 번 영상을 돌려봅니다. 주일의 은혜가 기술적인 피로감으로 변색되고 있습니다.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/5 to-transparent p-10 rounded-[2.5rem] border border-blue-500/10 glass-panel hover:border-blue-500/30 transition-all duration-500 group">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">
                  부족한 전문 인력
                </h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  고가의 장비와 복잡한 편집 툴... 전문 인력을 구하기는 어렵고, 성도들에게 맡기기엔 퀄리티가 우려됩니다. 도구의 한계가 복음의 확장을 막고 있습니다.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-10 bg-gold/10 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 rounded-[3rem] overflow-hidden border border-gold/20 shadow-divine group-hover:border-gold/40 transition-all duration-700">
                <img
                  src="https://images.unsplash.com/photo-1492619335444-887e4b1ec083?q=80&w=2071&auto=format&fit=crop"
                  alt="Ministry Media"
                  crossOrigin="anonymous"
                  className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-navy-darker/60 group-hover:bg-navy-darker/20 transition-all duration-700" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                  <div className="glass-panel-heavy p-10 rounded-3xl space-y-6 transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                    <TrendingUp className="w-12 h-12 text-gold mx-auto animate-bounce-slow" />
                    <h4 className="text-3xl font-black text-white italic tracking-tight">"사역은 장비가 아닌 마음입니다"</h4>
                    <p className="text-gold font-black text-sm uppercase tracking-widest">AI-men이 당신의 도구가 되어드립니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-32 bg-divine-radial relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">세상을 향한 복음의 통로,<br /><span className="text-gold-gradient font-serif transition-colors">AI-men Engine</span></h2>
            <p className="text-xl text-gray-500 leading-relaxed">최첨단 Gemini 2.5 Flash가 설교 속에 담긴 영적 통찰력을 분석합니다.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-12 space-y-8 group">
              <div className="w-20 h-20 bg-gold/5 rounded-3xl flex items-center justify-center border border-gold/10 shadow-inner group-hover:bg-gold/10 transition-colors">
                <Zap className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">AI 신학적 분석</h3>
              <p className="text-gray-400 leading-relaxed text-lg">단순한 타임라인 추출이 아닙니다. 설교의 신학적 핵심과 감동의 파동을 분석하여 시청자의 영혼을 깨울 최고의 구간을 정확히 식별합니다.</p>
            </Card>

            <Card className="glass-card p-12 space-y-8 group">
              <div className="w-20 h-20 bg-gold/5 rounded-3xl flex items-center justify-center border border-gold/10 shadow-inner group-hover:bg-gold/10 transition-colors">
                <Grid3x3 className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">멀티 플랫폼 최적화</h3>
              <p className="text-gray-400 leading-relaxed text-lg">YouTube Shorts, Instagram Reels, TikTok... 각 플랫폼의 알고리즘에 최적화된 프레임 비율과 자막 배치를 자동으로 완성하여 노출 가능성을 극대화합니다.</p>
            </Card>

            <Card className="glass-card p-12 space-y-8 group">
              <div className="w-20 h-20 bg-gold/5 rounded-3xl flex items-center justify-center border border-gold/10 shadow-inner group-hover:bg-gold/10 transition-colors">
                <Languages className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">글로벌 다국어 지원</h3>
              <p className="text-gray-400 leading-relaxed text-lg">AI 음성 복제(Voice Cloning)와 정교한 다국어 자막 기능을 통해, 전 세계 열방을 향한 선교의 지경을 막힘 없이 넓혀드립니다.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-32 bg-navy-darker relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-black mb-8">단 세 번의 클릭으로 완성</h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-gold to-transparent rounded-full mb-8 shadow-glow" />
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Video, title: "설교 업로드", desc: "고화질 영상이나 유튜브 링크를 등록합니다.", step: "01" },
              { icon: Sparkles, title: "AI 정밀 분석", desc: "AI가 가장 은혜로운 3-5개 구간을 선별합니다.", step: "02" },
              { icon: Scissors, title: "클립 자동 생성", desc: "플랫폼별 최적의 비율로 즉시 커팅됩니다.", step: "03" },
              { icon: TrendingUp, title: "전도 및 공유", desc: "알고리즘을 타고 복음이 온 세상에 퍼집니다.", step: "04", active: true }
            ].map((item, idx) => (
              <div key={idx} className={`relative p-12 rounded-[3rem] transition-all duration-500 hover:-translate-y-4 border ${item.active ? 'bg-gold/10 border-gold/40 shadow-divine' : 'bg-navy-light/20 border-white/5 glass-panel'} group text-center`}>
                <span className={`absolute top-6 left-6 text-6xl font-black transition-colors ${item.active ? 'text-gold/20' : 'text-white/5 group-hover:text-gold/10'}`}>{item.step}</span>
                <item.icon className="w-14 h-14 text-gold mx-auto mb-8 group-hover:scale-110 transition-transform duration-500" />
                <h4 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-divine-light relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">하나님의 나라에는<br /><span className="text-gold-gradient">구독료보다 사역이 먼저입니다.</span></h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">누구든지 복음 전파를 시작하실 수 있도록 영구적인 무료 체험을 약속합니다.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="glass-panel p-16 rounded-[4rem] border-white/5 relative group transition-all duration-500 hover:border-gold/20">
              <h4 className="text-lg font-black text-gray-500 mb-4 uppercase tracking-[0.2em]">Starter Plan</h4>
              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-7xl font-black text-white">₩0</span>
                <span className="text-gray-500 font-bold tracking-widest text-sm">/ 영구 무료</span>
              </div>
              <ul className="space-y-6 mb-16">
                {[
                  "1 개의 설교 영상 분석",
                  "개별 하이라이트 3-5개 추출",
                  "표준 SNS 자막 레이아웃 제공",
                  "공유용 공개 URL 생성"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-400 font-medium">
                    <Check className="w-6 h-6 text-gold flex-shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => status === 'authenticated' ? router.push('/dashboard') : signIn('kakao', { callbackUrl: '/dashboard' })}
                className="w-full py-6 rounded-2xl border border-[#FEE500]/30 hover:bg-[#FEE500]/10 text-white font-black text-lg transition-all shadow-none"
              >
                {status === 'authenticated' ? '대시보드로 이동' : '무료로 시작하기'}
              </Button>
            </div>

            <div className="glass-panel p-16 rounded-[4rem] border-gold/40 bg-gold/5 relative overflow-hidden group shadow-divine transition-all duration-500 hover:-translate-y-2">
              <div className="absolute top-8 right-8 bg-gold text-navy text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.3em] shadow-glow">Most Chosen</div>
              <h4 className="text-lg font-black text-gold mb-4 uppercase tracking-[0.2em]">Prophet Plan</h4>
              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-7xl font-black text-white">₩99,000</span>
                <span className="text-gray-500 font-bold tracking-widest text-sm">/ 월</span>
              </div>
              <ul className="space-y-6 mb-16">
                {[
                  "무제한 설교 영상 분석 활성화",
                  "4K 초고화질 무변형 클립 추출",
                  "프리미엄 폰트 및 커스텀 디자인",
                  "전용 워커 할당 (가장 빠른 처리 속도)",
                  "1:1 기술 지원 및 사역 컨설팅"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-4 text-white font-bold group-hover:text-gold transition-colors">
                    <Check className="w-6 h-6 text-gold flex-shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => status === 'authenticated' ? router.push('/dashboard/upgrade') : signIn('kakao', { callbackUrl: '/dashboard/upgrade' })}
                className="w-full py-6 rounded-2xl bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] font-black text-lg shadow-divine transform group-hover:scale-105 transition-all border-none"
              >
                {status === 'authenticated' ? '업그레이드 하기' : '프로 라이선스 획득'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 relative overflow-hidden bg-navy-darker">
        <div className="absolute inset-0 bg-gold/5 blur-[150px] animate-pulse" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto space-y-16">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] animate-fade-in">
              복음의 전령이 되기에<br />
              <span className="text-gold-gradient italic">가장 완벽한 도구.</span>
            </h2>
            <p className="text-2xl md:text-3xl text-gray-500 font-medium">세상의 목소리가 아닌, 주님의 말씀이 알고리즘을 타게 하세요.</p>
            <div className="pt-10">
              <button
                onClick={() => status === 'authenticated' ? router.push('/dashboard') : signIn('kakao', { callbackUrl: '/dashboard' })}
                className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] px-20 py-8 rounded-[2rem] font-black text-3xl shadow-divine transition-all hover:scale-110 active:scale-95 animate-glow-pulse"
              >
                {status === 'authenticated' ? '대시보드 접속' : '카카오로 3초 만에 체험'}
              </button>
            </div>
            <div className="flex justify-center gap-12 mt-16 pt-16 border-t border-white/5 opacity-30 text-gray-400 font-bold uppercase tracking-widest text-xs">
              <span>✓ 신용카드 불필요</span>
              <span>·</span>
              <span>✓ 99.9% 가용성 보장</span>
              <span>·</span>
              <span>✓ 24/7 사역 모니터링</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-navy-darker border-t border-gold/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 mb-24">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center shadow-divine">
                  <span className="text-navy font-black text-2xl">A</span>
                </div>
                <span className="text-white font-bold text-3xl tracking-tighter">AI<span className="text-gold">-men</span></span>
              </div>
              <p className="text-gray-500 leading-relaxed font-medium">
                우리는 기술을 통해 교회의 사역을 돕고, 모든 이들에게 복음의 기쁜 소식이 닿을 수 있도록 혁신합니다.
              </p>
            </div>

            <div className="space-y-8 pt-4">
              <h5 className="text-gold font-black uppercase tracking-[0.3em] text-xs">Engine Menu</h5>
              <ul className="space-y-6 text-sm text-gray-400 font-bold uppercase tracking-widest">
                <li><a href="#features" className="hover:text-gold transition-colors">Core Features</a></li>
                <li><a href="#process" className="hover:text-gold transition-colors">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-gold transition-colors">Pricing Plans</a></li>
              </ul>
            </div>

            <div className="space-y-8 pt-4">
              <h5 className="text-gold font-black uppercase tracking-[0.3em] text-xs">Community</h5>
              <ul className="space-y-6 text-sm text-gray-400 font-bold uppercase tracking-widest">
                <li><a href="#" className="hover:text-gold transition-colors">Ministry Blog</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">YouTube Channel</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Support Center</a></li>
              </ul>
            </div>

            <div className="space-y-8 pt-4">
              <h5 className="text-gold font-black uppercase tracking-[0.3em] text-xs">Connect Us</h5>
              <ul className="space-y-6 text-sm text-gray-400 font-bold">
                <li>contact@aimen.com</li>
                <li>서울특별시 성동구 성수동 사역빌딩 7F</li>
                <li className="text-gold font-black">주일의 은혜를 평일의 일상으로</li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-500 text-xs font-bold tracking-widest uppercase">
            <p>&copy; 2026 AI-men. All Glory to God. 에이아이멘 미디어 그룹.</p>
            <div className="flex gap-12">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
