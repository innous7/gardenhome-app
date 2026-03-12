"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Clock, Eye, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { BLOG_CATEGORIES } from "@/lib/constants";
import type { BlogCategory } from "@/types";
import type { Tables } from "@/types/supabase";

const categoryFilters = [
  { label: "전체", value: "ALL" },
  { label: "조경 트렌드", value: "TREND" },
  { label: "식물 가이드", value: "PLANT_GUIDE" },
  { label: "시공 팁", value: "TIPS" },
  { label: "계절별 관리", value: "SEASONAL" },
  { label: "비용 가이드", value: "COST_GUIDE" },
  { label: "시공 사례", value: "CASE_STUDY" },
];

export default function BlogPage() {
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [blogPosts, setBlogPosts] = useState<Tables<"blog_posts">[]>([]);
  const [displayCount, setDisplayCount] = useState(7);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => setBlogPosts(data ?? []));
  }, []);

  useEffect(() => { setDisplayCount(7); }, [category, search]);

  const filtered = blogPosts.filter((p) => {
    const matchCat = category === "ALL" || p.category === category;
    const matchSearch = search === "" || p.title.includes(search) || p.excerpt.includes(search);
    return matchCat && matchSearch;
  });

  const gradients = [
    "from-green-300 to-emerald-500",
    "from-teal-300 to-green-500",
    "from-emerald-300 to-teal-500",
    "from-lime-300 to-green-500",
  ];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">조경 블로그</h1>
          <p className="text-gray-500 mt-2">조경에 대한 유용한 정보와 트렌드를 만나보세요</p>

          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="검색어를 입력하세요"
              className="pl-10 h-12 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categoryFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setCategory(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === f.value
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured post (first post large) */}
        {filtered.length > 0 && (
          <Link href={`/blog/${filtered[0].slug}`} className="group block mb-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all grid grid-cols-1 lg:grid-cols-2">
              <div className={`aspect-[16/10] lg:aspect-auto bg-gradient-to-br ${gradients[0]}`} />
              <div className="p-6 lg:p-10 flex flex-col justify-center">
                <Badge className="w-fit bg-green-50 text-green-700 hover:bg-green-50 mb-4">
                  {BLOG_CATEGORIES[filtered[0].category as BlogCategory]}
                </Badge>
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {filtered[0].title}
                </h2>
                <p className="text-gray-500 mt-3 leading-relaxed">{filtered[0].excerpt}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {filtered[0].published_at}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {filtered[0].views.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Rest of posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(1, displayCount).map((post, i) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col">
                <div className={`aspect-[16/10] bg-gradient-to-br ${gradients[(i + 1) % gradients.length]}`} />
                <div className="p-5 flex flex-col flex-1">
                  <Badge className="w-fit bg-green-50 text-green-700 hover:bg-green-50 mb-2 text-xs">
                    {BLOG_CATEGORIES[post.category as BlogCategory]}
                  </Badge>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 flex-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.published_at}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {post.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {(post.tags as string[]).slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-gray-400">#{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        {displayCount < filtered.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setDisplayCount(prev => prev + 6)}
              className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              더 보기 ({filtered.length - displayCount}개 남음)
            </button>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
