"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { createContract } from "../actions";

type QuoteItem = {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
};

type QuoteDetail = {
  id: string;
  total: number;
  items: QuoteItem[];
  status: string;
  companies: { id: string; company_name: string } | null;
  quote_requests: { project_type: string; location: string } | null;
};

export default function NewContractPageWrapper() {
  return <Suspense fallback={<div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>}><NewContractPage /></Suspense>;
}

function NewContractPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quoteId = searchParams.get("quote");

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quoteId) {
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("quotes")
        .select("*, companies(id, company_name), quote_requests(project_type, location)")
        .eq("id", quoteId)
        .single();

      if (fetchError || !data) {
        setError("견적서를 찾을 수 없습니다.");
      } else {
        setQuote(data as any);
      }
      setLoading(false);
    };

    fetchQuote();
  }, [quoteId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quote) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("quoteId", quote.id);

    const result = await createContract(formData);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else if (result.contractId) {
      router.push(`/contracts/${result.contractId}`);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!quoteId) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-gray-400 mb-4">견적서 ID가 필요합니다.</p>
          <Link href="/mypage/quotes">
            <Button variant="outline" className="rounded-xl">견적서 목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-gray-400 mb-4">{error || "견적서를 찾을 수 없습니다."}</p>
          <Link href="/mypage/quotes">
            <Button variant="outline" className="rounded-xl">견적서 목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  const items = (quote.items as QuoteItem[]) || [];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/mypage/quotes">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">계약서 생성</h1>
            <p className="text-sm text-gray-500 mt-1">수락된 견적서를 기반으로 계약서를 작성합니다.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quote Summary */}
          <Card className="rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-gray-900">견적 요약</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">시공 업체</span>
                <span className="font-medium text-gray-900">{quote.companies?.company_name || "-"}</span>
              </div>
              {quote.quote_requests?.project_type && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">시공 유형</span>
                  <span className="font-medium text-gray-900">{quote.quote_requests.project_type}</span>
                </div>
              )}
              {quote.quote_requests?.location && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">시공 위치</span>
                  <span className="font-medium text-gray-900">{quote.quote_requests.location}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-500 font-medium">항목</th>
                      <th className="text-right py-2 text-gray-500 font-medium">수량</th>
                      <th className="text-right py-2 text-gray-500 font-medium">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="py-2 text-gray-900">{item.name}</td>
                        <td className="py-2 text-right text-gray-600">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 text-right font-medium text-gray-900">
                          {item.amount?.toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between mt-3 pt-3 border-t">
                  <span className="font-semibold text-gray-900">총 금액</span>
                  <span className="font-bold text-lg text-green-600">
                    {quote.total?.toLocaleString()}원
                  </span>
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="mt-4 pt-4 border-t flex justify-between">
                <span className="font-semibold text-gray-900">총 금액</span>
                <span className="font-bold text-lg text-green-600">
                  {quote.total?.toLocaleString()}원
                </span>
              </div>
            )}
          </Card>

          {/* Contract Details */}
          <Card className="rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">계약 조건</h2>

            <div className="space-y-4">
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  착공일
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  완공 예정일
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Warranty Terms */}
              <div>
                <label htmlFor="warrantyTerms" className="block text-sm font-medium text-gray-700 mb-1">
                  하자보수 조건
                </label>
                <input
                  type="text"
                  id="warrantyTerms"
                  name="warrantyTerms"
                  defaultValue="시공 완료일로부터 1년"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Special Terms */}
              <div>
                <label htmlFor="specialTerms" className="block text-sm font-medium text-gray-700 mb-1">
                  특약사항
                </label>
                <textarea
                  id="specialTerms"
                  name="specialTerms"
                  rows={4}
                  placeholder="추가 계약 조건이 있으면 입력해 주세요."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-base font-medium disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                생성 중...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                계약서 생성
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
