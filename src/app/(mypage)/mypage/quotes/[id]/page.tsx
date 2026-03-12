"use client";

import { useState, useEffect, use, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, FileSignature, MessageCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES } from "@/lib/constants";
import { createOrGetChatRoom } from "@/app/(main)/chat/actions";

type QuoteItem = {
  category: string;
  name: string;
  amount: number;
};

type ReceivedQuote = {
  id: string;
  total: number;
  subtotal: number;
  tax: number;
  items: QuoteItem[];
  notes: string;
  payment_terms: string;
  valid_until: string | null;
  created_at: string;
  status: string;
  companies: {
    id: string;
    company_name: string;
    rating: number;
    review_count: number;
  } | null;
};

type QuoteRequestDetail = {
  id: string;
  project_type: string;
  location: string;
  area: number;
  budget: string | null;
  requirements: string;
  status: string;
  created_at: string;
  quotes: ReceivedQuote[];
};

export default function QuoteComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [request, setRequest] = useState<QuoteRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("quote_requests")
        .select(
          "*, quotes(*, companies(id, company_name, rating, review_count))"
        )
        .eq("id", id)
        .single();
      setRequest(data as QuoteRequestDetail | null);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  if (!request)
    return (
      <div className="text-center py-20 text-gray-400">
        견적 요청을 찾을 수 없습니다.
      </div>
    );

  const quotes = request.quotes || [];
  const cheapest =
    quotes.length > 0 ? Math.min(...quotes.map((q) => q.total)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/mypage/quotes">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">견적 비교</h1>
          <p className="text-gray-500 mt-1">
            {PROJECT_TYPES[request.project_type]} &middot; {request.location}{" "}
            &middot; {request.area}㎡
          </p>
        </div>
      </div>

      {/* Request summary */}
      <Card className="p-5 bg-gray-50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">프로젝트</span>
            <p className="font-medium mt-0.5">
              {PROJECT_TYPES[request.project_type]}
            </p>
          </div>
          <div>
            <span className="text-gray-500">위치</span>
            <p className="font-medium mt-0.5">{request.location}</p>
          </div>
          <div>
            <span className="text-gray-500">면적</span>
            <p className="font-medium mt-0.5">{request.area}㎡</p>
          </div>
          <div>
            <span className="text-gray-500">예산</span>
            <p className="font-medium mt-0.5">{request.budget || "미정"}</p>
          </div>
        </div>
        {request.requirements && (
          <p className="text-sm text-gray-600 mt-3 pt-3 border-t">
            {request.requirements}
          </p>
        )}
      </Card>

      {/* Quotes comparison */}
      {quotes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">아직 받은 견적이 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">
            조경회사의 견적을 기다려주세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes
            .sort((a, b) => a.total - b.total)
            .map((q) => (
              <Card
                key={q.id}
                className={`overflow-hidden ${q.total === cheapest ? "ring-2 ring-green-500" : ""}`}
              >
                {q.total === cheapest && (
                  <div className="bg-green-600 text-white text-xs font-medium text-center py-1.5">
                    최저가
                  </div>
                )}
                <div className="p-5">
                  {/* Company info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-600">
                      {q.companies?.company_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {q.companies?.company_name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {q.companies?.rating?.toFixed(1)} (
                        {q.companies?.review_count})
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-center py-4 border-y">
                    <p className="text-3xl font-bold text-gray-900">
                      {q.total?.toLocaleString()}
                      <span className="text-base font-normal">원</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">VAT 포함</p>
                  </div>

                  {/* Item breakdown */}
                  <div className="mt-4 space-y-1.5">
                    {(q.items as QuoteItem[])?.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate mr-2">
                          {item.name || item.category}
                        </span>
                        <span className="text-gray-900 font-medium whitespace-nowrap">
                          {item.amount?.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                    {(q.items as QuoteItem[])?.length > 5 && (
                      <p className="text-xs text-gray-400">
                        외 {(q.items as QuoteItem[]).length - 5}건
                      </p>
                    )}
                  </div>

                  {/* Payment terms */}
                  {q.payment_terms && (
                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
                      {q.payment_terms}
                    </p>
                  )}

                  {/* Valid until */}
                  {q.valid_until && (
                    <p className="text-xs text-gray-400 mt-2">
                      유효기간:{" "}
                      {new Date(q.valid_until).toLocaleDateString("ko-KR")}
                    </p>
                  )}

                  {/* Action */}
                  <div className="mt-4 space-y-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/companies/${q.companies?.id}`}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full rounded-xl text-sm"
                        >
                          회사 보기
                        </Button>
                      </Link>
                      {q.status === "SENT" && (
                        <Link
                          href={`/contracts/new?quote=${q.id}`}
                          className="flex-1"
                        >
                          <Button className="w-full rounded-xl text-sm bg-green-600 hover:bg-green-700 text-white">
                            <FileSignature className="w-4 h-4 mr-1" />
                            견적 수락
                          </Button>
                        </Link>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl text-sm"
                        disabled={isPending}
                        onClick={() => {
                          if (!q.companies?.id) return;
                          startTransition(async () => {
                            const result = await createOrGetChatRoom(q.companies!.id);
                            if (result?.roomId) {
                              router.push(`/chat/${result.roomId}`);
                            }
                          });
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        문의하기
                      </Button>
                      {q.status === "SENT" && (
                        <Button
                          variant="outline"
                          className="flex-1 rounded-xl text-sm text-red-600 hover:bg-red-50"
                          disabled={isPending}
                          onClick={() => {
                            if (!confirm("이 견적을 거절하시겠습니까?")) return;
                            startTransition(async () => {
                              const supabase = createClient();
                              await supabase
                                .from("quotes")
                                .update({ status: "REJECTED" })
                                .eq("id", q.id);
                              // Refresh data
                              const { data } = await supabase
                                .from("quote_requests")
                                .select("*, quotes(*, companies(id, company_name, rating, review_count))")
                                .eq("id", id)
                                .single();
                              setRequest(data as QuoteRequestDetail | null);
                            });
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          거절
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
