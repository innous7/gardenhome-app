"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, FolderOpen, Sprout, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES } from "@/lib/constants";

const quoteStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "견적 대기", color: "text-yellow-600 bg-yellow-50" },
  MATCHED: { label: "매칭 완료", color: "text-green-600 bg-green-50" },
  COMPLETED: { label: "완료", color: "text-gray-600 bg-gray-100" },
  CANCELLED: { label: "취소", color: "text-red-600 bg-red-50" },
};

export default function MypageDashboard() {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({ quotes: 0, contracts: 0, flotren: 0 });
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      setUserName(profile?.name || "");

      const [qr, cr, fr] = await Promise.all([
        supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("customer_id", user.id),
        supabase.from("contracts").select("id", { count: "exact", head: true }).eq("customer_id", user.id),
        supabase.from("flotren_subscriptions").select("id", { count: "exact", head: true }).eq("customer_id", user.id),
      ]);
      setStats({ quotes: qr.count || 0, contracts: cr.count || 0, flotren: fr.count || 0 });

      const { data: quotes } = await supabase
        .from("quote_requests")
        .select("id, project_type, location, status, created_at, quotes(id)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      setRecentQuotes(quotes || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  const maskedName = userName ? userName.charAt(0) + "**" : "사용자";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">안녕하세요, {maskedName}님</h1>
        <p className="text-gray-500 mt-1">GardenHome에서 나의 조경 프로젝트를 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.quotes}</p>
              <p className="text-xs text-gray-500">견적 요청</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.contracts}</p>
              <p className="text-xs text-gray-500">진행 중 프로젝트</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.flotren || "-"}</p>
              <p className="text-xs text-gray-500">Flotren 구독</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 견적 요청</h2>
        <Card>
          <div className="divide-y">
            {recentQuotes.length > 0 ? (
              recentQuotes.map((item) => {
                const projectType = PROJECT_TYPES[item.project_type] || "기타";
                const status = quoteStatusMap[item.status] || quoteStatusMap.PENDING;
                const quoteCount = Array.isArray(item.quotes) ? item.quotes.length : 0;

                return (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{projectType}</p>
                      <p className="text-sm text-gray-500">
                        {item.location} · {new Date(item.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {quoteCount > 0 && (
                        <span className="text-xs text-gray-500">견적 {quoteCount}건</span>
                      )}
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400">
                아직 견적 요청 내역이 없습니다.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Flotren CTA */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">조경관리가 필요하신가요?</h3>
            <p className="text-sm text-gray-500 mt-1">Flotren 조경관리 서비스로 사계절 아름다운 정원을 유지하세요</p>
          </div>
          <Link href="/flotren">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl whitespace-nowrap">
              알아보기 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
