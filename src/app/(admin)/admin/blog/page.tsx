"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";
import { BLOG_CATEGORIES } from "@/lib/constants";
import type { BlogCategory } from "@/types";
import { deleteBlogPost } from "./actions";

export default function AdminBlogPage() {
  const [search, setSearch] = useState("");
  const [blogPosts, setBlogPosts] = useState<Tables<"blog_posts">[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const fetchBlogPosts = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBlogPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;

    setError("");
    startTransition(async () => {
      const result = await deleteBlogPost(id);
      if (result?.error) {
        setError("삭제 실패: " + result.error);
      } else {
        await fetchBlogPosts();
      }
    });
  };

  const filtered = blogPosts.filter(p =>
    p.title.includes(search) || p.excerpt.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">블로그 관리</h1>
          <p className="text-gray-500 mt-1">블로그 콘텐츠를 작성하고 관리하세요</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            새 글 작성
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="제목 또는 내용으로 검색"
          className="pl-10 h-11 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">등록된 블로그 글이 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">새 글을 작성해 보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <Card key={post.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-green-50 text-green-700 hover:bg-green-50 text-xs">
                      {BLOG_CATEGORIES[post.category as BlogCategory]}
                    </Badge>
                    {post.is_published && post.published_at && new Date(post.published_at) > new Date() ? (
                      <Badge className="bg-amber-50 text-amber-700 text-xs"><Clock className="w-3 h-3 mr-0.5 inline" />예약</Badge>
                    ) : post.is_published ? (
                      <Badge className="bg-blue-50 text-blue-700 text-xs">공개</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 text-xs">비공개</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{post.excerpt}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>작성일: {post.created_at?.slice(0, 10)}</span>
                    <span>발행일: {post.published_at?.slice(0, 10) || "-"}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-blue-600">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/blog/${post.slug}/edit`}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-green-600">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-400 hover:text-red-600"
                    disabled={isPending}
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
