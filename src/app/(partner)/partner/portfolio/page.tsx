"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Heart, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";
import { PROJECT_TYPES, GARDEN_STYLES } from "@/lib/constants";
import { deletePortfolio, togglePortfolioPublish } from "./actions";

export default function PartnerPortfolioPage() {
  const [portfolios, setPortfolios] = useState<Tables<"portfolios">[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchPortfolios = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (company) {
        const { data } = await supabase
          .from("portfolios")
          .select("*")
          .eq("company_id", company.id)
          .order("created_at", { ascending: false });
        setPortfolios(data ?? []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말로 이 포트폴리오를 삭제하시겠습니까?")) return;
    setError("");
    const result = await deletePortfolio(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setError("");
    const result = await togglePortfolioPublish(id, !currentStatus);
    if (result?.error) {
      setError(result.error);
    } else {
      setPortfolios((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, is_published: !currentStatus } : p
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">포트폴리오 관리</h1>
          <p className="text-gray-500 mt-1">시공 사례를 등록하고 관리하세요</p>
        </div>
        <Link href="/partner/portfolio/new">
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            새 포트폴리오
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      {portfolios.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">등록된 포트폴리오가 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">시공 사례를 등록해 보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolios.map((p, i) => {
            const gradients = ["from-green-400 to-emerald-600", "from-teal-400 to-green-600", "from-emerald-400 to-cyan-600"];
            return (
              <Card key={p.id} className="overflow-hidden">
                <div className={`aspect-[16/9] bg-gradient-to-br ${gradients[i % gradients.length]} relative`}>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-white/90 text-gray-700 text-xs">{PROJECT_TYPES[p.project_type]}</Badge>
                    <button
                      onClick={() => handleTogglePublish(p.id, p.is_published)}
                      className="cursor-pointer"
                    >
                      {p.is_published ? (
                        <Badge className="bg-green-600/90 text-white text-xs hover:bg-green-700/90">공개</Badge>
                      ) : (
                        <Badge className="bg-gray-600/90 text-white text-xs hover:bg-gray-700/90">비공개</Badge>
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-2 text-white text-xs">
                    <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                      <Eye className="w-3 h-3" /> {p.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3" /> {p.likes}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{p.excerpt}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>{p.location}</span>
                      <span>{p.area}㎡</span>
                      <span>{p.created_at?.slice(0, 10)}</span>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/partner/portfolio/${p.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
