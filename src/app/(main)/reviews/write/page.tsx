"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { createClient } from "@/lib/supabase/client";
import { submitReview } from "./actions";

const ratingCategories = [
  { key: "design", label: "디자인" },
  { key: "quality", label: "시공 품질" },
  { key: "communication", label: "의사소통" },
  { key: "schedule", label: "일정 준수" },
  { key: "value", label: "가성비" },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5"
        >
          <Star
            className={`w-6 h-6 ${
              (hover || value) >= star
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function WriteReviewPageWrapper() {
  return <Suspense fallback={<div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>}><WriteReviewPage /></Suspense>;
}

function WriteReviewPage() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") || "";
  const [company, setCompany] = useState<{ id: string; company_name: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState({
    design: 0,
    quality: 0,
    communication: 0,
    schedule: 0,
    value: 0,
  });
  const [overall, setOverall] = useState(0);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!companyId) return;
    const supabase = createClient();
    supabase
      .from("companies")
      .select("id, company_name")
      .eq("id", companyId)
      .single()
      .then(({ data }) => setCompany(data));
  }, [companyId]);

  // Auto-calculate overall from category averages
  useEffect(() => {
    const vals = Object.values(ratings).filter((v) => v > 0);
    if (vals.length > 0) {
      setOverall(
        Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
      );
    }
  }, [ratings]);

  const handleSubmit = () => {
    if (!companyId || overall === 0) return;
    setError(null);
    const fd = new FormData();
    fd.set("companyId", companyId);
    fd.set("rating", overall.toString());
    fd.set("designRating", ratings.design.toString());
    fd.set("qualityRating", ratings.quality.toString());
    fd.set("communicationRating", ratings.communication.toString());
    fd.set("scheduleRating", ratings.schedule.toString());
    fd.set("valueRating", ratings.value.toString());
    fd.set("content", content);
    fd.set("images", JSON.stringify(images));
    startTransition(async () => {
      const result = await submitReview(fd);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={company ? `/companies/${company.id}` : "/companies"}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">리뷰 작성</h1>
            {company && (
              <p className="text-gray-500 mt-0.5">{company.company_name}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
          {/* Rating categories */}
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">평점</h2>
            {ratingCategories.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">
                  {cat.label}
                </span>
                <StarRating
                  value={ratings[cat.key as keyof typeof ratings]}
                  onChange={(v) =>
                    setRatings((prev) => ({ ...prev, [cat.key]: v }))
                  }
                />
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm font-bold text-gray-900">전체 평점</span>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-xl font-bold text-gray-900">
                  {overall || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <Label className="text-lg font-semibold text-gray-900 mb-3 block">
              상세 리뷰
            </Label>
            <Textarea
              placeholder="시공 경험을 자세히 공유해주세요. 다른 고객에게 도움이 됩니다."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="rounded-xl min-h-[150px]"
            />
          </div>

          {/* Image upload */}
          <div>
            <Label className="text-lg font-semibold text-gray-900 mb-3 block">
              사진 첨부
            </Label>
            <p className="text-sm text-gray-500 mb-3">
              시공 결과물 사진을 첨부하면 더 도움이 됩니다.
            </p>
            <MultiImageUpload
              bucket="reviews"
              folder="images"
              value={images}
              onChange={setImages}
              maxImages={5}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isPending || overall === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            리뷰 등록
          </Button>
        </div>
      </div>
    </div>
  );
}
