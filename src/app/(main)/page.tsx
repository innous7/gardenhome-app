export const dynamic = 'force-dynamic';

import HeroSection from "@/components/home/HeroSection";
import PortfolioGrid from "@/components/home/PortfolioGrid";
import CompanyShowcase from "@/components/home/CompanyShowcase";
import BlogPreview from "@/components/home/BlogPreview";
import FlotrenBanner from "@/components/home/FlotrenBanner";
import StatsSection from "@/components/home/StatsSection";
import CTASection from "@/components/home/CTASection";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GardenHome (조경홈)",
    "description": "조경 전문업체와 고객을 연결하는 조경 중개 플랫폼",
    "url": "https://gardenhome.kr",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <StatsSection />
      <PortfolioGrid />
      <CompanyShowcase />
      <BlogPreview />
      <FlotrenBanner />
      <CTASection />
    </>
  );
}
