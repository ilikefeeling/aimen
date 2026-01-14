import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { ClientWrapper } from "./client-wrapper";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
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
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable} antialiased`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}


