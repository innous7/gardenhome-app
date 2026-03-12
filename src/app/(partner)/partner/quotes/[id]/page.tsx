"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { QUOTE_STATUS_LABELS } from "@/lib/constants";
import { updateQuoteStatus } from "../actions";

type QuoteItem = {
  category: string;
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
};

type QuoteDetail = {
  id: string;
  status: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  valid_until: string | null;
  notes: string;
  payment_terms: string;
  created_at: string;
  companies: {
    company_name: string;
    address: string;
    phone: string;
    representative: string;
  } | null;
  profiles: { name: string; email: string; phone: string | null } | null;
  quote_requests: {
    project_type: string;
    location: string;
    area: number;
  } | null;
};

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("quotes")
        .select(
          "*, companies(company_name, address, phone, representative), profiles!quotes_customer_id_fkey(name, email, phone), quote_requests(project_type, location, area)"
        )
        .eq("id", id)
        .single();
      setQuote(data as QuoteDetail | null);
      setLoading(false);
    };
    fetchQuote();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  if (!quote)
    return (
      <div className="text-center py-20 text-gray-400">
        견적서를 찾을 수 없습니다.
      </div>
    );

  const items = (quote.items as QuoteItem[]) || [];
  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SENT: "bg-blue-50 text-blue-700",
    VIEWED: "bg-yellow-50 text-yellow-700",
    ACCEPTED: "bg-green-50 text-green-700",
    REJECTED: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header - hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/partner/quotes">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">견적서</h1>
            <Badge
              className={`text-xs mt-1 ${statusColors[quote.status] || ""}`}
            >
              {QUOTE_STATUS_LABELS[quote.status] || quote.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-2" /> 인쇄 / PDF
          </Button>
          {quote.status === "DRAFT" && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
              onClick={async () => {
                await updateQuoteStatus(quote.id, "SENT" as any);
                setQuote({ ...quote, status: "SENT" });
              }}
            >
              <Send className="w-4 h-4 mr-2" /> 발송
            </Button>
          )}
        </div>
      </div>

      {/* Printable Quote */}
      <div className="bg-white rounded-xl border p-8 print:border-0 print:p-0 print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">견 적 서</h2>
            <p className="text-sm text-gray-500 mt-1">
              No. {quote.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-sm text-gray-500">
              발행일:{" "}
              {new Date(quote.created_at).toLocaleDateString("ko-KR")}
            </p>
            {quote.valid_until && (
              <p className="text-sm text-gray-500">
                유효기간:{" "}
                {new Date(quote.valid_until).toLocaleDateString("ko-KR")}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-gray-900">
              {quote.companies?.company_name}
            </p>
            <p className="text-sm text-gray-500">
              {quote.companies?.address}
            </p>
            <p className="text-sm text-gray-500">
              Tel: {quote.companies?.phone}
            </p>
            <p className="text-sm text-gray-500">
              대표: {quote.companies?.representative}
            </p>
          </div>
        </div>

        {/* Customer info */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4 print:bg-white print:border">
          <p className="text-sm font-medium text-gray-700">
            수 신: {quote.profiles?.name} 님
          </p>
          {quote.quote_requests && (
            <p className="text-sm text-gray-500 mt-1">
              프로젝트: {quote.quote_requests.location} &middot;{" "}
              {quote.quote_requests.area}㎡
            </p>
          )}
        </div>

        {/* Items table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-y bg-gray-50 print:bg-gray-100">
              <th className="text-left p-3 font-medium text-gray-600">분류</th>
              <th className="text-left p-3 font-medium text-gray-600">품명</th>
              <th className="text-left p-3 font-medium text-gray-600">규격</th>
              <th className="text-right p-3 font-medium text-gray-600">
                수량
              </th>
              <th className="text-right p-3 font-medium text-gray-600">
                단위
              </th>
              <th className="text-right p-3 font-medium text-gray-600">
                단가
              </th>
              <th className="text-right p-3 font-medium text-gray-600">
                금액
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="p-3 text-gray-600">{item.category}</td>
                <td className="p-3 text-gray-900 font-medium">{item.name}</td>
                <td className="p-3 text-gray-600">{item.spec}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td className="p-3 text-right text-gray-600">{item.unit}</td>
                <td className="p-3 text-right">
                  {item.unitPrice?.toLocaleString()}원
                </td>
                <td className="p-3 text-right font-medium">
                  {item.amount?.toLocaleString()}원
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">소계</span>
              <span>{quote.subtotal?.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">부가세 (10%)</span>
              <span>{quote.tax?.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>합계</span>
              <span className="text-green-600">
                {quote.total?.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* Payment terms & notes */}
        {quote.payment_terms && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              결제 조건
            </p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg print:bg-white print:border">
              {quote.payment_terms}
            </p>
          </div>
        )}
        {quote.notes && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">특이사항</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg print:bg-white print:border">
              {quote.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
