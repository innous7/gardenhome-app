"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, Eye, Heart, Pencil, Trash2, X, ExternalLink, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";
import Link from "next/link";
import { updatePortfolio, deletePortfolio, togglePortfolioPublish } from "../actions";

interface PortfolioWithCompany extends Tables<"portfolios"> {
  companies: { company_name: string } | null;
}

const projectTypeLabels: Record<string, string> = {
  GARDEN: "정원",
  ROOFTOP: "옥상",
  BALCONY: "발코니",
  COMMERCIAL: "상업",
  PUBLIC: "공공",
  INTERIOR: "실내",
  OTHER: "기타",
};

const styleLabels: Record<string, string> = {
  MODERN: "모던",
  NATURAL: "자연",
  KOREAN: "한국식",
  JAPANESE: "일본식",
  ENGLISH: "영국식",
  MINIMALIST: "미니멀",
  TROPICAL: "열대",
  MEDITERRANEAN: "지중해",
  OTHER: "기타",
};

export default function AdminPortfoliosPage() {
  const [portfolios, setPortfolios] = useState<PortfolioWithCompany[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "published" | "draft">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioWithCompany | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    excerpt: "",
    location: "",
    budget: "",
    duration: "",
    is_published: true,
  });

  const fetchPortfolios = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("portfolios")
      .select("*, companies(company_name)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPortfolios(data as PortfolioWithCompany[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleEdit = (portfolio: PortfolioWithCompany) => {
    setEditingPortfolio(portfolio);
    setEditForm({
      title: portfolio.title,
      excerpt: portfolio.excerpt || "",
      location: portfolio.location || "",
      budget: portfolio.budget || "",
      duration: portfolio.duration || "",
      is_published: portfolio.is_published,
    });
  };

  const handleEditSave = () => {
    if (!editingPortfolio) return;
    setError("");

    startTransition(async () => {
      const result = await updatePortfolio(editingPortfolio.id, editForm);
      if (result?.error) {
        setError("수정 실패: " + result.error);
      } else {
        setEditingPortfolio(null);
        await fetchPortfolios();
      }
    });
  };

  const handleDelete = (portfolioId: string, title: string) => {
    if (!confirm(`"${title}" 포트폴리오를 정말 삭제하시겠습니까?`)) return;

    setError("");
    startTransition(async () => {
      const result = await deletePortfolio(portfolioId);
      if (result?.error) {
        setError("삭제 실패: " + result.error);
      } else {
        await fetchPortfolios();
      }
    });
  };

  const handleTogglePublish = (portfolioId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await togglePortfolioPublish(portfolioId, currentStatus);
      if (result?.error) {
        setError("변경 실패: " + result.error);
      } else {
        await fetchPortfolios();
      }
    });
  };

  const filtered = portfolios.filter((p) => {
    const matchSearch =
      search === "" ||
      p.title.includes(search) ||
      p.companies?.company_name?.includes(search);
    const matchFilter =
      filter === "ALL" ||
      (filter === "published" && p.is_published) ||
      (filter === "draft" && !p.is_published);
    return matchSearch && matchFilter;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">포트폴리오 관리</h1>
        <p className="text-gray-500 mt-1">등록된 포트폴리오를 관리하세요</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      {/* Edit Modal */}
      {editingPortfolio && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingPortfolio(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">포트폴리오 수정</h2>
              <button onClick={() => setEditingPortfolio(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">제목</label>
                <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">요약</label>
                <textarea
                  value={editForm.excerpt}
                  onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">위치</label>
                  <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">예산</label>
                  <Input value={editForm.budget} onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">소요 기간</label>
                  <Input value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} className="rounded-xl" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 pb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.is_published}
                      onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">공개</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setEditingPortfolio(null)}>취소</Button>
              <Button className="rounded-xl bg-green-600 hover:bg-green-700 text-white" onClick={handleEditSave} disabled={isPending}>
                {isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="제목 또는 회사명으로 검색"
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {([
            { value: "ALL", label: "전체" },
            { value: "published", label: "공개" },
            { value: "draft", label: "비공개" },
          ] as const).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                filter === f.value
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        총 <span className="font-semibold text-gray-900">{filtered.length}</span>개 포트폴리오
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">포트폴리오가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((portfolio) => (
            <Card key={portfolio.id} className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Thumbnail */}
                <div className="w-full sm:w-28 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  {portfolio.cover_image_url ? (
                    <img src={portfolio.cover_image_url} alt={portfolio.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{portfolio.title}</h3>
                        {portfolio.is_published ? (
                          <Badge className="bg-green-50 text-green-700 text-xs">공개</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 text-xs">비공개</Badge>
                        )}
                        <Badge className="bg-blue-50 text-blue-700 text-xs">
                          {projectTypeLabels[portfolio.project_type] || portfolio.project_type}
                        </Badge>
                        <Badge className="bg-purple-50 text-purple-700 text-xs">
                          {styleLabels[portfolio.style] || portfolio.style}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {portfolio.companies?.company_name || "알 수 없는 회사"}
                        {portfolio.location && <> · {portfolio.location}</>}
                        {portfolio.budget && <> · {portfolio.budget}</>}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{portfolio.views}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{portfolio.likes}</span>
                        <span>{formatDate(portfolio.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs"
                    onClick={() => handleTogglePublish(portfolio.id, portfolio.is_published)}
                    disabled={isPending}
                  >
                    {portfolio.is_published ? "비공개" : "공개"}
                  </Button>
                  <Link href={`/explore/${portfolio.id}`} target="_blank">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs"
                    onClick={() => handleEdit(portfolio)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(portfolio.id, portfolio.title)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
