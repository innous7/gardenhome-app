"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, Eye, MapPin, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES, GARDEN_STYLES } from "@/lib/constants";

const typeFilters = [
  { label: "전체", value: "ALL" },
  { label: "정원", value: "GARDEN" },
  { label: "옥상", value: "ROOFTOP" },
  { label: "베란다", value: "VERANDA" },
  { label: "상업시설", value: "COMMERCIAL" },
];

const styleFilters = [
  { label: "전체", value: "ALL" },
  { label: "모던", value: "MODERN" },
  { label: "한국 전통", value: "TRADITIONAL" },
  { label: "자연주의", value: "NATURAL" },
  { label: "미니멀", value: "MINIMAL" },
  { label: "영국식", value: "ENGLISH" },
  { label: "일본식", value: "JAPANESE" },
];

type PortfolioWithCompany = {
  id: string;
  company_id: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  project_type: string;
  style: string;
  area: number | null;
  duration: string | null;
  location: string | null;
  budget: string | null;
  is_published: boolean;
  views: number;
  likes: number;
  created_at: string;
  companies: { id: string; company_name: string } | null;
};

export default function ExplorePage() {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [styleFilter, setStyleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [portfolios, setPortfolios] = useState<PortfolioWithCompany[]>([]);
  const [displayCount, setDisplayCount] = useState(12);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("portfolios")
      .select("*, companies(id, company_name)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPortfolios((data as PortfolioWithCompany[] | null) ?? []));
  }, []);

  useEffect(() => { setDisplayCount(12); }, [typeFilter, styleFilter, search]);

  const filtered = portfolios.filter((p) => {
    const matchType = typeFilter === "ALL" || p.project_type === typeFilter;
    const matchStyle = styleFilter === "ALL" || p.style === styleFilter;
    const matchSearch = search === "" || p.title.includes(search) || (p.location ?? "").includes(search);
    return matchType && matchStyle && matchSearch;
  });

  const gradients = [
    "from-green-400 to-emerald-600",
    "from-teal-400 to-green-600",
    "from-emerald-400 to-cyan-600",
    "from-lime-400 to-green-600",
    "from-green-500 to-teal-600",
    "from-emerald-500 to-green-700",
  ];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 lg:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="프로젝트, 지역으로 검색"
                className="pl-10 h-11 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Type filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {typeFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    typeFilter === f.value
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <span className="text-gray-300 flex items-center">|</span>
              {styleFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStyleFilter(f.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    styleFilter === f.value
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-500 mb-6">{filtered.length}개의 포트폴리오</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, displayCount).map((p, i) => (
            <Link key={p.id} href={`/explore/${p.id}`} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                <div className={`relative aspect-[4/3] bg-gradient-to-br ${gradients[i % gradients.length]}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/20 text-7xl font-bold">{p.style.charAt(0)}</span>
                  </div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-white/90 text-gray-700 text-xs">{PROJECT_TYPES[p.project_type]}</Badge>
                    <Badge className="bg-green-600/90 text-white text-xs">{GARDEN_STYLES[p.style]}</Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-2 text-white text-xs">
                    <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                      <Eye className="w-3 h-3" /> {p.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3" /> {p.likes}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.excerpt}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {p.location}
                    </span>
                    <span className="text-xs font-medium text-green-600">{p.companies?.company_name}</span>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span>{p.area}㎡</span>
                    <span>{p.duration}</span>
                    <span>{p.budget}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {displayCount < filtered.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setDisplayCount(prev => prev + 12)}
              className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              더 보기 ({filtered.length - displayCount}개 남음)
            </button>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
