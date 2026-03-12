"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES, BUDGET_RANGES } from "@/lib/constants";

interface QuoteWithCompany {
  id: string;
  total: number;
  status: string;
  companies: { company_name: string } | null;
}

interface QuoteRequest {
  id: string;
  project_type: string;
  location: string;
  area: number;
  budget: string | null;
  status: string;
  created_at: string;
  quotes: QuoteWithCompany[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "매칭 중", color: "bg-yellow-50 text-yellow-700" },
  MATCHED: { label: "견적 도착", color: "bg-green-50 text-green-700" },
  COMPLETED: { label: "완료", color: "bg-gray-100 text-gray-600" },
  CANCELLED: { label: "취소", color: "bg-red-50 text-red-700" },
};

function CustomerQuotesContent() {
  const searchParams = useSearchParams();
  const justSubmitted = searchParams.get("submitted") === "true";
  const [showSuccessBanner, setShowSuccessBanner] = useState(justSubmitted);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showSuccessBanner) {
      const timer = setTimeout(() => setShowSuccessBanner(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessBanner]);

  useEffect(() => {
    async function fetchQuotes() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("quote_requests")
          .select("*, quotes(*, companies(company_name))")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });
        if (data) {
          setQuoteRequests(data as unknown as QuoteRequest[]);
        }
      }
      setLoading(false);
    }
    fetchQuotes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">견적 내역</h1>
          <p className="text-gray-500 mt-1">요청한 견적과 받은 견적서를 확인하세요</p>
        </div>
        <Link href="/quote">
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
            새 견적 요청
          </Button>
        </Link>
      </div>

      {/* Success banner */}
      {showSuccessBanner && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-800">견적 요청이 성공적으로 접수되었습니다!</p>
            <p className="text-sm text-green-600 mt-0.5">보통 1~3일 내 조경회사에서 견적서를 보내드립니다. 견적서가 도착하면 알림으로 안내해드릴게요.</p>
          </div>
          <button onClick={() => setShowSuccessBanner(false)} className="text-green-400 hover:text-green-600 ml-auto shrink-0">
            &times;
          </button>
        </div>
      )}

      {quoteRequests.length === 0 ? (
        <Card className="p-8 text-center text-gray-400 text-sm">
          아직 요청한 견적이 없습니다.
        </Card>
      ) : (
        <div className="space-y-6">
          {quoteRequests.map((qr) => {
            const statusInfo = statusLabels[qr.status] || { label: qr.status, color: "bg-gray-100 text-gray-600" };
            return (
              <Card key={qr.id} className="overflow-hidden">
                <div className="p-5 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {PROJECT_TYPES[qr.project_type] || qr.project_type}
                        </h3>
                        <Badge className={`text-xs ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {qr.location} · {qr.area}㎡{qr.budget ? ` · ${qr.budget}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {qr.quotes && qr.quotes.length > 0 && (
                        <Link href={`/mypage/quotes/${qr.id}`}>
                          <Button variant="outline" size="sm" className="rounded-lg text-xs">
                            견적 비교
                          </Button>
                        </Link>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(qr.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </div>
                {qr.quotes.length > 0 ? (
                  <div className="divide-y">
                    {qr.quotes.map((q) => (
                      <div key={q.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center text-sm font-bold text-green-600">
                            {q.companies?.company_name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {q.companies?.company_name || "알 수 없음"}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {q.total.toLocaleString()}원
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg text-xs">
                          <Eye className="w-3 h-3 mr-1" /> 견적서 보기
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    아직 받은 견적이 없습니다. 조경회사의 견적을 기다려주세요.
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CustomerQuotesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CustomerQuotesContent />
    </Suspense>
  );
}
