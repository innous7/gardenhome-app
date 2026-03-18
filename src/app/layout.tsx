import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GardenHome - 조경 전문 중개 플랫폼",
    template: "%s | GardenHome",
  },
  description: "당신의 정원, 전문가와 함께. 검증된 조경회사와 함께 나만의 정원을 완성하세요. 무료 견적부터 시공, 사후관리까지.",
  keywords: ["조경", "정원", "조경회사", "정원 시공", "조경 견적", "정원 관리", "GardenHome", "조경홈"],
  openGraph: {
    title: "GardenHome - 조경 전문 중개 플랫폼",
    description: "당신의 정원, 전문가와 함께. 검증된 조경회사와 함께 나만의 정원을 완성하세요.",
    siteName: "GardenHome",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
