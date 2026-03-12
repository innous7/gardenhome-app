"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Upload, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Card } from "@/components/ui/card";
import { BLOG_CATEGORIES } from "@/lib/constants";
import { createBlogPost } from "../actions";

export default function NewBlogPostPage() {
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

  const generateSlug = (t: string) => {
    return t.toLowerCase().replace(/[^a-z0-9가-힣]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  };

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
      const result = await createBlogPost(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

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
            <h1 className="text-2xl font-bold text-gray-900">새 블로그 글 작성</h1>
            <p className="text-gray-500 mt-0.5">SEO 최적화된 콘텐츠를 작성하세요</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl">
            <Eye className="w-4 h-4 mr-2" /> 미리보기
          </Button>
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <Label>제목 *</Label>
              <Input
                placeholder="블로그 제목을 입력하세요"
                className="mt-1.5 h-14 rounded-xl text-lg font-semibold"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setSlug(generateSlug(e.target.value)); }}
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

        {/* Sidebar */}
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
              {scheduledAt && new Date(scheduledAt) > new Date() && (
                <p className="text-xs text-amber-600 mt-1">예약 발행됩니다</p>
              )}
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
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">이미지 업로드</p>
              <p className="text-xs text-gray-400 mt-1">권장: 1200x630px</p>
              <Button variant="outline" size="sm" className="mt-3 rounded-full">파일 선택</Button>
            </div>
            <Input
              placeholder="또는 이미지 URL 입력"
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
            <p className="text-xs text-gray-400">쉼표로 구분하여 입력하세요</p>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">SEO 설정</h3>
            <div>
              <Label className="text-xs">Meta Title</Label>
              <Input placeholder="검색결과 제목" className="mt-1 h-9 rounded-xl text-sm" />
            </div>
            <div>
              <Label className="text-xs">Meta Description</Label>
              <Textarea placeholder="검색결과 설명" className="mt-1 rounded-xl text-sm" rows={2} />
            </div>
            <div>
              <Label className="text-xs">OG Image URL</Label>
              <Input placeholder="소셜 공유 이미지 URL" className="mt-1 h-9 rounded-xl text-sm" />
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom actions */}
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
