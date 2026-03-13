"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleScrap } from "@/app/(main)/explore/actions";
import { useAuth } from "@/components/auth/AuthProvider";

interface ScrapButtonProps {
  portfolioId: string;
  initialScrapped?: boolean;
  className?: string;
}

export function ScrapButton({ portfolioId, initialScrapped = false, className = "" }: ScrapButtonProps) {
  const { requireAuth } = useAuth();
  const [scrapped, setScrapped] = useState(initialScrapped);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth("포트폴리오를 저장하려면 로그인이 필요합니다.")) return;
    setLoading(true);
    const result = await toggleScrap(portfolioId);
    if ("scrapped" in result && result.scrapped !== undefined) {
      setScrapped(result.scrapped);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors ${className}`}
    >
      <Bookmark className={`w-4 h-4 ${scrapped ? "text-green-600 fill-green-600" : "text-gray-500"}`} />
    </button>
  );
}
