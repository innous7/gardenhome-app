"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { createPost } from "../actions";

export default function CommunityWritePage() {
  const router = useRouter();
  const [type, setType] = useState("SHOW");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `community/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { data, error } = await supabase.storage.from("portfolios").upload(fileName, file);
      if (!error && data) {
        const { data: urlData } = supabase.storage.from("portfolios").getPublicUrl(data.path);
        setImages(prev => [...prev, urlData.publicUrl]);
      }
    }
    setUploading(false);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().replace("#", "");
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags(prev => [...prev, tag]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.set("type", type);
    formData.set("title", title);
    formData.set("content", content);
    formData.set("images", JSON.stringify(images));
    formData.set("tags", JSON.stringify(tags));

    const result = await createPost(formData);
    if ("postId" in result && result.postId) {
      router.push(`/community/${result.postId}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/community">
            <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">글쓰기</h1>
        </div>

        <Card className="p-6 space-y-5">
          {/* Type selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">카테고리</label>
            <div className="flex gap-2">
              <button onClick={() => setType("SHOW")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${type === "SHOW" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                정원 자랑
              </button>
              <button onClick={() => setType("QNA")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${type === "QNA" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                Q&A
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">제목</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목을 입력하세요" className="h-11 rounded-xl" />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">내용</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={type === "SHOW" ? "정원을 자랑해주세요! 어떤 식물을 심었는지, 시공 과정은 어땠는지 자유롭게 작성해주세요." : "궁금한 점을 자세히 작성해주세요."}
              rows={8}
              className="w-full px-4 py-3 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">사진</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 flex items-center justify-center cursor-pointer text-gray-400 hover:text-green-500 transition-colors">
                {uploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />
                ) : (
                  <span className="text-2xl">+</span>
                )}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">태그</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="#태그 입력 후 Enter"
                className="h-10 rounded-xl flex-1"
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    #{tag}
                    <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="text-green-400 hover:text-green-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={!title.trim() || submitting} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 text-base">
            {submitting ? "등록 중..." : "게시하기"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
