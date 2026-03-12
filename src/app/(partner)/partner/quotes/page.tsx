"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Eye, Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_TYPES, QUOTE_STATUS_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { updateQuoteStatus, deleteQuote } from "./actions";

type QuoteWithDetails = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  quote_requests: { project_type: string; location: string; area: number; budget: string | null } | null;
  profiles: { name: string } | null;
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-50 text-blue-700",
  VIEWED: "bg-yellow-50 text-yellow-700",
  ACCEPTED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

function maskName(name: string | null | undefined): string {
  if (!name) return "익명";
  return name.charAt(0) + "**";
}

export default function PartnerQuotesPage() {
  const [filter, setFilter] = useState("ALL");
  const [quotes, setQuotes] = useState<QuoteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchQuotes = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!company) return;

    const { data } = await supabase
      .from("quotes")
      .select("*, quote_requests(project_type, location, area, budget), profiles!quotes_customer_id_fkey(name)")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (data) setQuotes(data as QuoteWithDetails[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleSend = async (quoteId: string) => {
    setActionLoading(quoteId);
    setError("");
    const result = await updateQuoteStatus(quoteId, "SENT");
    if (result?.error) {
      setError(result.error);
    } else {
      await fetchQuotes();
    }
    setActionLoading(null);
  };

  const handleDelete = async (quoteId: string) => {
    if (!confirm("이 견적서를 삭제하시겠습니까?")) return;
    setActionLoading(quoteId);
    setError("");
    const result = await deleteQuote(quoteId);
    if (result?.error) {
      setError(result.error);
    } else {
      await fetchQuotes();
    }
    setActionLoading(null);
  };

  const filtered = filter === "ALL" ? quotes : quotes.filter((q) => q.status === filter);

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">견적 관리</h1>
          <p className="text-gray-500 mt-1">견적서를 작성하고 관리하세요</p>
        </div>
        <Link href="/partner/quotes/new">
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            견적서 작성
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ label: "전체", value: "ALL" }, ...Object.entries(QUOTE_STATUS_LABELS).map(([k, v]) => ({ label: v, value: k }))].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.value ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Quote List */}
      <div className="space-y-3">
        {filtered.map((q) => {
          const customerName = maskName(q.profiles?.name);
          const projectType = q.quote_requests?.project_type
            ? PROJECT_TYPES[q.quote_requests.project_type] || q.quote_requests.project_type
            : "-";
          const location = q.quote_requests?.location || "-";
          const area = q.quote_requests?.area ? `${q.quote_requests.area}㎡` : "-";
          const budget = q.quote_requests?.budget || "-";
          const createdAt = q.created_at ? new Date(q.created_at).toLocaleDateString("ko-KR") : "-";
          const isActioning = actionLoading === q.id;

          return (
            <Card key={q.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                    {customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{customerName}</h3>
                      <Badge className={`text-xs ${statusColors[q.status] || "bg-gray-100 text-gray-700"}`}>
                        {QUOTE_STATUS_LABELS[q.status] || q.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{projectType} · {location} · {area}</p>
                    <p className="text-xs text-gray-400 mt-1">예산: {budget} · 작성일: {createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <p className="text-lg font-bold text-gray-900">{(q.total ?? 0).toLocaleString()}원</p>
                  <div className="flex gap-1">
                    <Link href={`/partner/quotes/${q.id}`}>
                      <Button variant="outline" size="sm" className="rounded-lg text-xs">
                        <Eye className="w-3 h-3 mr-1" /> 보기
                      </Button>
                    </Link>
                    {q.status === "DRAFT" && (
                      <>
                        <Button
                          size="sm"
                          className="rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleSend(q.id)}
                          disabled={isActioning}
                        >
                          {isActioning ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                          발송
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-xs text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(q.id)}
                          disabled={isActioning}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">해당하는 견적서가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
