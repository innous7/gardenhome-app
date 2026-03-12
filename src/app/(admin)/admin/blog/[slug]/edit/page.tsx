"use client";

import { useState, useEffect, useTransition, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Globe, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Card } from "@/components/ui/card";
import { BLOG_CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { updateBlogPost } from "../../actions";

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: slugParam } = use(params);
  const [loading, setLoading] = useState(true);
  const [postId, setPostId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      const supabase = createClient();
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slugParam)
        .single();

      if (data) {
        setPostId(data.id);
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content || "");
        setExcerpt(data.excerpt || "");
        setCategory(data.category || "");
        setTags((data.tags as string[] || []).join(", "));
        setCoverImageUrl(data.cover_image_url || "");
        setStatus(data.is_published ? "published" : "draft");
        if (data.published_at) {
          const d = new Date(data.published_at);
          setScheduledAt(d.toISOString().slice(0, 16));
        }
      }
      setLoading(false);
    }
    fetchPost();
  }, [slugParam]);

  const handleSubmit = (isPublished: boolean) => {
    setError(null);
    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("content", content);
    formData.set("excerpt", excerpt);
    formData.set("category", category);
    formData.set("tags", JSON.stringify(tags.split(",").map(t => t.trim()).filter(Boolean)));
    formData.set("coverImageUrl", coverImageUrl);
    formData.set("isPublished", String(isPublished));
    formData.set("scheduledAt", scheduledAt ? new Date(scheduledAt).toISOString() : "");

    startTransition(async () => {
      const result = await updateBlogPost(postId, formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">블로그 글 수정</h1>
            <p className="text-gray-500 mt-0.5">기존 콘텐츠를 수정합니다</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
            disabled={isPending}
            onClick={() => handleSubmit(true)}
          >
            <Globe className="w-4 h-4 mr-2" /> {isPending ? "저장 중..." : "발행하기"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <Label>제목 *</Label>
              <Input
                placeholder="블로그 제목을 입력하세요"
                className="mt-1.5 h-14 rounded-xl text-lg font-semibold"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>URL 슬러그</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-sm text-gray-400">/blog/</span>
                <Input
                  className="h-10 rounded-xl text-sm"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <Label>본문 *</Label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="블로그 내용을 작성하세요..."
            />
          </Card>

          <Card className="p-6 space-y-4">
            <Label>요약 (SEO Description)</Label>
            <Textarea
              placeholder="검색엔진에 표시될 요약을 작성하세요 (150자 이내)"
              className="rounded-xl min-h-[80px]"
              maxLength={150}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">발행 설정</h3>
            <div>
              <Label>상태</Label>
              <select
                className="mt-1.5 w-full h-10 rounded-xl border border-gray-200 px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">초안</option>
                <option value="published">발행</option>
              </select>
            </div>
            <div>
              <Label>발행일</Label>
              <Input
                type="datetime-local"
                className="mt-1.5 h-10 rounded-xl"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">카테고리</h3>
            <select
              className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">카테고리 선택</option>
              {Object.entries(BLOG_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">대표 이미지</h3>
            {coverImageUrl && (
              <img src={coverImageUrl} alt="Cover" className="w-full h-32 object-cover rounded-xl" />
            )}
            <Input
              placeholder="이미지 URL 입력"
              className="h-10 rounded-xl text-sm"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">태그</h3>
            <Input
              placeholder="태그 입력 (쉼표로 구분)"
              className="h-10 rounded-xl"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </Card>
        </div>
      </div>

      <div className="flex gap-3 justify-end border-t pt-6">
        <Button
          variant="outline"
          className="rounded-xl px-6"
          disabled={isPending}
          onClick={() => handleSubmit(false)}
        >
          <Save className="w-4 h-4 mr-2" /> {isPending ? "저장 중..." : "임시 저장"}
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6"
          disabled={isPending}
          onClick={() => handleSubmit(true)}
        >
          <Globe className="w-4 h-4 mr-2" /> {isPending ? "저장 중..." : "발행하기"}
        </Button>
      </div>
    </div>
  );
}
