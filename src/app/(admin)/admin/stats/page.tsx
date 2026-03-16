"use client";

import { useState, useEffect } from "react";
import { Users, Building2, FileText, TrendingUp, Eye, Star, MessageSquare, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface MonthlyData {
  month: string;
  count: number;
}

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalQuoteRequests: 0,
    totalPortfolios: 0,
    totalReviews: 0,
    totalContracts: 0,
    totalBlogPosts: 0,
    totalBlogViews: 0,
    customerCount: 0,
    companyCount: 0,
    adminCount: 0,
    approvedCompanies: 0,
    pendingCompanies: 0,
    publishedPortfolios: 0,
    monthlySignups: [] as MonthlyData[],
    monthlyQuotes: [] as MonthlyData[],
  });

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      const [
        profiles,
        companies,
        quoteRequests,
        portfolios,
        reviews,
        contracts,
        blogPosts,
        customers,
        companyUsers,
        admins,
        approvedCo,
        pendingCo,
        publishedPf,
        blogViews,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("quote_requests").select("id", { count: "exact", head: true }),
        supabase.from("portfolios").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("contracts").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "CUSTOMER"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "COMPANY"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "ADMIN"),
        supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_approved", true),
        supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_approved", false),
        supabase.from("portfolios").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("blog_posts").select("views"),
      ]);

      // Calculate monthly signups (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const { data: recentProfiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", sixMonthsAgo.toISOString());

      const { data: recentQuotes } = await supabase
        .from("quote_requests")
        .select("created_at")
        .gte("created_at", sixMonthsAgo.toISOString());

      const monthlySignups = getMonthlyData(recentProfiles || []);
      const monthlyQuotes = getMonthlyData(recentQuotes || []);

      const totalBlogViews = (blogViews.data || []).reduce((sum, b) => sum + (b.views || 0), 0);

      setStats({
        totalUsers: profiles.count || 0,
        totalCompanies: companies.count || 0,
        totalQuoteRequests: quoteRequests.count || 0,
        totalPortfolios: portfolios.count || 0,
        totalReviews: reviews.count || 0,
        totalContracts: contracts.count || 0,
        totalBlogPosts: blogPosts.count || 0,
        totalBlogViews: totalBlogViews,
        customerCount: customers.count || 0,
        companyCount: companyUsers.count || 0,
        adminCount: admins.count || 0,
        approvedCompanies: approvedCo.count || 0,
        pendingCompanies: pendingCo.count || 0,
        publishedPortfolios: publishedPf.count || 0,
        monthlySignups,
        monthlyQuotes,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  function getMonthlyData(items: { created_at: string }[]): MonthlyData[] {
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = 0;
    }
    items.forEach((item) => {
      const d = new Date(item.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in months) months[key]++;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const overviewStats = [
    { label: "총 회원", value: stats.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "조경회사", value: stats.totalCompanies, icon: Building2, color: "text-green-600 bg-green-50" },
    { label: "견적 요청", value: stats.totalQuoteRequests, icon: FileText, color: "text-purple-600 bg-purple-50" },
    { label: "포트폴리오", value: stats.totalPortfolios, icon: Briefcase, color: "text-orange-600 bg-orange-50" },
    { label: "리뷰", value: stats.totalReviews, icon: Star, color: "text-yellow-600 bg-yellow-50" },
    { label: "계약", value: stats.totalContracts, icon: TrendingUp, color: "text-red-600 bg-red-50" },
    { label: "블로그 글", value: stats.totalBlogPosts, icon: MessageSquare, color: "text-indigo-600 bg-indigo-50" },
    { label: "블로그 조회수", value: stats.totalBlogViews, icon: Eye, color: "text-pink-600 bg-pink-50" },
  ];

  const maxSignup = Math.max(...stats.monthlySignups.map((d) => d.count), 1);
  const maxQuote = Math.max(...stats.monthlyQuotes.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">통계</h1>
        <p className="text-gray-500 mt-1">플랫폼 전체 운영 통계를 확인하세요</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">회원 유형 분포</h3>
          <div className="space-y-3">
            {[
              { label: "고객", count: stats.customerCount, color: "bg-blue-500" },
              { label: "조경회사", count: stats.companyCount, color: "bg-green-500" },
              { label: "관리자", count: stats.adminCount, color: "bg-purple-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-16">{item.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${stats.totalUsers > 0 ? Math.max((item.count / stats.totalUsers) * 100, 8) : 0}%` }}
                  >
                    <span className="text-xs text-white font-medium">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">조경회사 현황</h3>
          <div className="space-y-3">
            {[
              { label: "승인됨", count: stats.approvedCompanies, color: "bg-green-500" },
              { label: "대기중", count: stats.pendingCompanies, color: "bg-yellow-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-16">{item.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${stats.totalCompanies > 0 ? Math.max((item.count / stats.totalCompanies) * 100, 8) : 0}%` }}
                  >
                    <span className="text-xs text-white font-medium">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500">
                공개 포트폴리오: <span className="font-semibold text-gray-900">{stats.publishedPortfolios}</span>
                <span className="text-gray-400"> / {stats.totalPortfolios}개</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">월별 회원가입</h3>
          <div className="flex items-end gap-2 h-40">
            {stats.monthlySignups.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">{d.count}</span>
                <div
                  className="w-full bg-blue-500 rounded-t-md min-h-[4px]"
                  style={{ height: `${(d.count / maxSignup) * 120}px` }}
                />
                <span className="text-[10px] text-gray-400">{d.month.split("-")[1]}월</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">월별 견적 요청</h3>
          <div className="flex items-end gap-2 h-40">
            {stats.monthlyQuotes.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">{d.count}</span>
                <div
                  className="w-full bg-purple-500 rounded-t-md min-h-[4px]"
                  style={{ height: `${(d.count / maxQuote) * 120}px` }}
                />
                <span className="text-[10px] text-gray-400">{d.month.split("-")[1]}월</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
