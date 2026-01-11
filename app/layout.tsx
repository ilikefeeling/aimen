import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "aimen (에이아이멘) - AI 기반 설교 콘텐츠 자동화",
  description: "주일의 은혜를 평일의 일상으로. Gemini AI로 설교 하이라이트를 자동 추출하고 숏폼 영상으로 편집하세요.",
  keywords: ["설교", "하이라이트", "AI", "영상편집", "교회", "콘텐츠", "숏폼"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
