"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Eye, FileText, Star, Users, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface PortfolioStat {
  id: string;
  title: string;
  views: number;
  likes: number;
}

export default function PartnerStatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    portfolioViews: 0,
    quoteRequestCount: 0,
    acceptRate: 0,
    completedProjects: 0,
  });
  const [topPortfolios, setTopPortfolios] = useState<PortfolioStat[]>([]);
  const [monthlyQuotes, setMonthlyQuotes] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: company } = await supabase
        .from("companies")
        .select("id, project_count")
        .eq("user_id", user.id)
        .single();

      if (!company) { setLoading(false); return; }

      // Fetch all stats in parallel
      const [portfoliosRes, quotesRes, acceptedQuotesRes, allQuotesRes] = await Promise.all([
        // Portfolio views
        supabase
          .from("portfolios")
          .select("id, title, views, likes")
          .eq("company_id", company.id)
          .order("views", { ascending: false })
          .limit(5),
        // Quote requests count (PENDING ones)
        supabase
          .from("quotes")
          .select("id, created_at, status", { count: "exact" })
          .eq("company_id", company.id),
        // Accepted quotes
        supabase
          .from("quotes")
          .select("id", { count: "exact", head: true })
          .eq("company_id", company.id)
          .eq("status", "ACCEPTED"),
        // All sent/accepted/rejected quotes for rate calculation
        supabase
          .from("quotes")
          .select("id", { count: "exact", head: true })
          .eq("company_id", company.id)
          .in("status", ["SENT", "ACCEPTED", "REJECTED"]),
      ]);

      const portfolios = portfoliosRes.data || [];
      const totalViews = portfolios.reduce((sum, p) => sum + (p.views || 0), 0);
      const allQuotes = quotesRes.data || [];
      const acceptedCount = acceptedQuotesRes.count || 0;
      const sentCount = allQuotesRes.count || 0;

      // Monthly quote trend (last 6 months)
      const now = new Date();
      const monthly: { month: string; count: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const count = allQuotes.filter(q => q.created_at?.startsWith(monthStr)).length;
        monthly.push({
          month: `${d.getMonth() + 1}월`,
          count,
        });
      }

      setStats({
        portfolioViews: totalViews,
        quoteRequestCount: allQuotes.length,
        acceptRate: sentCount > 0 ? Math.round((acceptedCount / sentCount) * 100) : 0,
        completedProjects: company.project_count || 0,
      });
      setTopPortfolios(portfolios as PortfolioStat[]);
      setMonthlyQuotes(monthly);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const maxMonthlyCount = Math.max(...monthlyQuotes.map(m => m.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">통계</h1>
        <p className="text-gray-500 mt-1">비즈니스 성과를 분석하세요</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.portfolioViews.toLocaleString()}</p>
              <p className="text-xs text-gray-500">포트폴리오 총 조회수</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.quoteRequestCount}</p>
              <p className="text-xs text-gray-500">총 견적서 작성</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.acceptRate}%</p>
              <p className="text-xs text-gray-500">견적 수락률</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
              <p className="text-xs text-gray-500">완료 프로젝트</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Simple bar chart */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">월별 견적서 작성 추이</h3>
        {monthlyQuotes.every(m => m.count === 0) ? (
          <div className="h-48 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">아직 견적서 데이터가 없습니다</p>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-4 h-48">
            {monthlyQuotes.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-700">{m.count}</span>
                <div
                  className="w-full bg-green-500 rounded-t-lg transition-all min-h-[4px]"
                  style={{ height: `${Math.max((m.count / maxMonthlyCount) * 160, 4)}px` }}
                />
                <span className="text-xs text-gray-500">{m.month}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">포트폴리오 인기 순위</h3>
        {topPortfolios.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">아직 등록된 포트폴리오가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {topPortfolios.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">{i + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{p.title}</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>조회 {(p.views || 0).toLocaleString()}</span>
                  <span>좋아요 {p.likes || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
