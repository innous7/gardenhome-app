"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleScrap } from "@/app/(main)/explore/actions";

interface ScrapButtonProps {
  portfolioId: string;
  initialScrapped?: boolean;
  className?: string;
}

export function ScrapButton({ portfolioId, initialScrapped = false, className = "" }: ScrapButtonProps) {
  const [scrapped, setScrapped] = useState(initialScrapped);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
