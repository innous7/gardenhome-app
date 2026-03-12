"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES } from "@/lib/constants";

type ScrapWithPortfolio = {
  id: string;
  portfolio_id: string;
  created_at: string;
  portfolios: {
    id: string;
    title: string;
    excerpt: string;
    project_type: string;
    style: string;
    location: string | null;
    cover_image_url: string | null;
    companies: { id: string; company_name: string } | null;
  } | null;
};

export default function CustomerScrapsPage() {
  const [scraps, setScraps] = useState<ScrapWithPortfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScraps = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("scraps")
        .select("id, portfolio_id, created_at, portfolios(id, title, excerpt, project_type, style, location, cover_image_url, companies(id, company_name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setScraps((data as ScrapWithPortfolio[] | null) ?? []);
      setLoading(false);
    };
    fetchScraps();
  }, []);

  const handleRemoveScrap = async (scrapId: string) => {
    const supabase = createClient();
    await supabase.from("scraps").delete().eq("id", scrapId);
    setScraps(scraps.filter(s => s.id !== scrapId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  const gradients = ["from-green-400 to-emerald-600", "from-teal-400 to-green-600", "from-emerald-400 to-cyan-600"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">스크랩</h1>
        <p className="text-gray-500 mt-1">저장한 포트폴리오를 확인하세요</p>
      </div>

      {scraps.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">스크랩한 포트폴리오가 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">마음에 드는 포트폴리오를 저장해 보세요</p>
          <Link href="/explore" className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700">
            포트폴리오 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {scraps.map((s, i) => {
            const p = s.portfolios;
            if (!p) return null;
            return (
              <Card key={s.id} className="overflow-hidden">
                <Link href={`/explore/${p.id}`}>
                  <div className={`aspect-[16/10] bg-gradient-to-br ${gradients[i % gradients.length]} relative`}>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-gray-700 text-xs">{PROJECT_TYPES[p.project_type]}</Badge>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); handleRemoveScrap(s.id); }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
                    >
                      <Bookmark className="w-4 h-4 text-green-600 fill-green-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{p.excerpt}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location}</span>
                      <span>{p.companies?.company_name}</span>
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
