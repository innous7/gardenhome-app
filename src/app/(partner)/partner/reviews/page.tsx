"use client";

import { useState, useEffect, useTransition } from "react";
import { Star, MessageCircle, Send, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";
import { replyToReview } from "./actions";

type ReviewWithProfile = Tables<"reviews"> & {
  profiles: { name: string } | null;
};

export default function PartnerReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!company) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles!reviews_customer_id_fkey(name)")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data as ReviewWithProfile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return;

    setError("");
    startTransition(async () => {
      const result = await replyToReview(reviewId, replyText.trim());
      if (result?.error) {
        setError("답글 실패: " + result.error);
      } else {
        setReplyingTo(null);
        setReplyText("");
        await fetchReviews();
      }
    });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingCounts = [5, 4, 3, 2, 1].map(n =>
    reviews.filter(r => Math.round(r.rating) === n).length
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">리뷰 관리</h1>
        <p className="text-gray-500 mt-1">고객 리뷰를 확인하고 답글을 달아보세요</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">아직 리뷰가 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">고객이 리뷰를 남기면 여기에 표시됩니다</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <Card className="p-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{avgRating}</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {Array.from({length: 5}).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">{reviews.length}개 리뷰</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map((n, idx) => (
                  <div key={n} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-gray-500">{n}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{width: reviews.length > 0 ? `${(ratingCounts[idx] / reviews.length) * 100}%` : "0%"}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Review List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                      {review.profiles?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.profiles?.name}</p>
                      <p className="text-xs text-gray-400">{review.created_at?.slice(0, 10)}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({length: 5}).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.content}</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                  <span>디자인 {review.design_rating}/5</span>
                  <span>품질 {review.quality_rating}/5</span>
                  <span>소통 {review.communication_rating}/5</span>
                  <span>일정 {review.schedule_rating}/5</span>
                  <span>가성비 {review.value_rating}/5</span>
                </div>
                {review.company_reply ? (
                  <div className="mt-4 bg-green-50 rounded-xl p-4">
                    <p className="text-xs text-green-700 font-medium mb-1">사장님 답글</p>
                    <p className="text-sm text-gray-700">{review.company_reply}</p>
                  </div>
                ) : replyingTo === review.id ? (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="답글을 입력하세요..."
                      className="rounded-xl text-sm min-h-[80px]"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg text-xs"
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                      >
                        <X className="w-3 h-3 mr-1" /> 취소
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white"
                        disabled={isPending || !replyText.trim()}
                        onClick={() => handleReply(review.id)}
                      >
                        <Send className="w-3 h-3 mr-1" /> {isPending ? "전송 중..." : "답글 등록"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-lg text-xs"
                    onClick={() => { setReplyingTo(review.id); setReplyText(""); }}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" /> 답글 달기
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
