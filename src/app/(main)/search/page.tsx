"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search as SearchIcon,
  Image as ImageIcon,
  Building2,
  FileText,
  Sprout,
  MessageSquare,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES, GARDEN_STYLES } from "@/lib/constants";

type SearchResult = {
  type: "portfolio" | "company" | "blog" | "plant" | "community";
  id: string;
  title: string;
  description: string;
  image?: string;
  link: string;
  badges?: string[];
  meta?: string;
};

const categoryConfig = {
  all: { label: "전체", icon: SearchIcon },
  portfolio: { label: "포트폴리오", icon: ImageIcon },
  company: { label: "조경회사", icon: Building2 },
  blog: { label: "블로그", icon: FileText },
  plant: { label: "식물", icon: Sprout },
  community: { label: "커뮤니티", icon: MessageSquare },
} as const;

type Category = keyof typeof categoryConfig;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = (searchParams.get("category") as Category) || "all";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category>(initialCategory);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (q: string, cat: Category) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }

    setLoading(true);
    setSearched(true);
    const supabase = createClient();
    const searchResults: SearchResult[] = [];
    const searchTerm = `%${q.trim()}%`;

    // Portfolio search
    if (cat === "all" || cat === "portfolio") {
      const { data } = await supabase
        .from("portfolios")
        .select("id, title, excerpt, cover_image_url, project_type, style, location, companies(company_name)")
        .eq("is_published", true)
        .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},location.ilike.${searchTerm}`)
        .limit(10);

      for (const p of data || []) {
        searchResults.push({
          type: "portfolio",
          id: p.id,
          title: p.title,
          description: p.excerpt || "",
          image: p.cover_image_url || undefined,
          link: `/explore/${p.id}`,
          badges: [
            PROJECT_TYPES[p.project_type] || p.project_type,
            GARDEN_STYLES[p.style] || p.style,
          ].filter(Boolean),
          meta: (p.companies as { company_name: string } | null)?.company_name || "",
        });
      }
    }

    // Company search
    if (cat === "all" || cat === "company") {
      const { data } = await supabase
        .from("companies")
        .select("id, company_name, description, logo_url, address, rating, review_count, specialties")
        .eq("is_approved", true)
        .or(`company_name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
        .limit(10);

      for (const c of data || []) {
        searchResults.push({
          type: "company",
          id: c.id,
          title: c.company_name,
          description: c.description?.slice(0, 100) || "",
          image: c.logo_url || undefined,
          link: `/companies/${c.id}`,
          badges: ((c.specialties as string[]) || []).slice(0, 3),
          meta: `${c.address} · ${Number(c.rating).toFixed(1)}점 (${c.review_count}개 리뷰)`,
        });
      }
    }

    // Blog search
    if (cat === "all" || cat === "blog") {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, slug, cover_image_url, category, published_at, views")
        .eq("is_published", true)
        .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .limit(10);

      for (const b of data || []) {
        searchResults.push({
          type: "blog",
          id: b.id,
          title: b.title,
          description: b.excerpt || "",
          image: b.cover_image_url || undefined,
          link: `/blog/${b.slug}`,
          badges: [b.category],
          meta: b.published_at
            ? new Date(b.published_at).toLocaleDateString("ko-KR") + ` · 조회 ${b.views}`
            : undefined,
        });
      }
    }

    // Plant search
    if (cat === "all" || cat === "plant") {
      const { data } = await supabase
        .from("plants")
        .select("id, name, scientific_name, description, image_url, category, difficulty")
        .or(`name.ilike.${searchTerm},scientific_name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10);

      for (const p of data || []) {
        searchResults.push({
          type: "plant",
          id: p.id,
          title: p.name,
          description: p.scientific_name || p.description?.slice(0, 80) || "",
          image: p.image_url || undefined,
          link: `/plants/${p.id}`,
          badges: [p.category, p.difficulty].filter(Boolean) as string[],
        });
      }
    }

    // Community search
    if (cat === "all" || cat === "community") {
      const { data } = await supabase
        .from("community_posts")
        .select("id, title, content, images, type, created_at, like_count, comment_count")
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .limit(10);

      for (const c of data || []) {
        const images = (c.images as string[]) || [];
        searchResults.push({
          type: "community",
          id: c.id,
          title: c.title,
          description: c.content?.slice(0, 100) || "",
          image: images[0] || undefined,
          link: `/community/${c.id}`,
          badges: [c.type],
          meta: `좋아요 ${c.like_count || 0} · 댓글 ${c.comment_count || 0}`,
        });
      }
    }

    setResults(searchResults);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, initialCategory);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "all") params.set("category", category);
    router.push(`/search?${params.toString()}`);
    performSearch(query, category);
  };

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    if (query) performSearch(query, cat);
  };

  const typeIcons: Record<string, typeof ImageIcon> = {
    portfolio: ImageIcon,
    company: Building2,
    blog: FileText,
    plant: Sprout,
    community: MessageSquare,
  };

  const typeLabels: Record<string, string> = {
    portfolio: "포트폴리오",
    company: "조경회사",
    blog: "블로그",
    plant: "식물도감",
    community: "커뮤니티",
  };

  // Group results by type for "all" view
  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="포트폴리오, 조경회사, 블로그, 식물 검색..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-lg bg-white"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </form>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {Object.entries(categoryConfig).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => handleCategoryChange(key as Category)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === key
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : searched && results.length === 0 ? (
          <Card className="p-12 text-center">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500 text-sm">다른 검색어나 카테고리로 시도해 보세요.</p>
          </Card>
        ) : category === "all" && searched ? (
          // Grouped view
          <div className="space-y-8">
            {Object.entries(groupedResults).map(([type, items]) => {
              const Icon = typeIcons[type] || SearchIcon;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <Icon className="w-5 h-5 text-green-600" />
                      {typeLabels[type] || type}
                      <Badge className="text-xs bg-gray-100 text-gray-600 ml-1">{items.length}</Badge>
                    </h2>
                    {items.length >= 5 && (
                      <button
                        onClick={() => handleCategoryChange(type as Category)}
                        className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        더보기 <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {items.slice(0, 5).map(r => (
                      <SearchResultCard key={`${r.type}-${r.id}`} result={r} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Flat list
          <div className="space-y-2">
            {results.map(r => (
              <SearchResultCard key={`${r.type}-${r.id}`} result={r} />
            ))}
          </div>
        )}

        {/* Popular searches when no query */}
        {!searched && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">인기 검색어</h2>
              <div className="flex flex-wrap gap-2">
                {["정원 조경", "옥상 정원", "잔디", "모던 정원", "일본식", "베란다", "수경시설", "전정", "조경 비용"].map(term => (
                  <button
                    key={term}
                    onClick={() => { setQuery(term); performSearch(term, category); }}
                    className="px-4 py-2 bg-white border rounded-full text-sm text-gray-600 hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">빠른 탐색</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "포트폴리오", href: "/explore", icon: ImageIcon, color: "bg-blue-50 text-blue-600" },
                  { label: "조경회사", href: "/companies", icon: Building2, color: "bg-green-50 text-green-600" },
                  { label: "블로그", href: "/blog", icon: FileText, color: "bg-purple-50 text-purple-600" },
                  { label: "식물도감", href: "/plants", icon: Sprout, color: "bg-amber-50 text-amber-600" },
                ].map(item => (
                  <Link key={item.label} href={item.href}>
                    <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const Icon = {
    portfolio: ImageIcon,
    company: Building2,
    blog: FileText,
    plant: Sprout,
    community: MessageSquare,
  }[result.type] || SearchIcon;

  return (
    <Link href={result.link}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex gap-4">
          {result.image ? (
            <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <img src={result.image} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{result.title}</h3>
              <Badge className="text-[10px] bg-gray-100 text-gray-500 shrink-0">
                {{ portfolio: "포트폴리오", company: "조경회사", blog: "블로그", plant: "식물", community: "커뮤니티" }[result.type]}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{result.description}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {result.badges?.map((badge, i) => (
                <Badge key={i} className="text-[10px] bg-green-50 text-green-700 font-normal">{badge}</Badge>
              ))}
              {result.meta && <span className="text-xs text-gray-400">{result.meta}</span>}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
