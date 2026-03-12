"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Eye, Star, TrendingUp, FolderOpen, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES } from "@/lib/constants";

interface Company {
  id: string;
  company_name: string;
  rating: number;
  review_count: number;
  project_count: number;
}

interface RecentQuote {
  id: string;
  project_type: string;
  location: string;
  budget: string | null;
  status: string;
  created_at: string;
  profiles: { name: string } | null;
}

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING: { label: "새 요청", className: "bg-blue-50 text-blue-700" },
  MATCHED: { label: "매칭됨", className: "bg-yellow-50 text-yellow-700" },
  COMPLETED: { label: "완료", className: "bg-green-50 text-green-700" },
  CANCELLED: { label: "취소", className: "bg-red-50 text-red-700" },
};

export default function PartnerDashboardPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get company
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (companyData) {
        setCompany(companyData);

        // Get portfolio count
        const { count } = await supabase
          .from("portfolios")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyData.id);
        setPortfolioCount(count || 0);
      }

      // Get recent quote requests (for this company's service areas/types)
      const { data: quotesData } = await supabase
        .from("quote_requests")
        .select("*, profiles!quote_requests_customer_id_fkey(name)")
        .eq("status", "PENDING")
        .order("created_at", { ascending: false })
        .limit(5);

      if (quotesData) {
        setRecentQuotes(quotesData as unknown as RecentQuote[]);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "받은 견적 요청",
      value: String(recentQuotes.length),
      icon: FileText,
      change: "",
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "포트폴리오 수",
      value: String(portfolioCount),
      icon: FolderOpen,
      change: "",
      color: "text-green-600 bg-green-50",
    },
    {
      label: "평균 평점",
      value: company?.rating ? company.rating.toFixed(1) : "-",
      icon: Star,
      change: company?.review_count ? `${company.review_count} 리뷰` : "리뷰 없음",
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      label: "완료 프로젝트",
      value: String(company?.project_count || 0),
      icon: TrendingUp,
      change: "",
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 mt-1">비즈니스 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                {stat.change && (
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Quote Requests */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 견적 요청</h2>
        <Card>
          {recentQuotes.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              아직 견적 요청이 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {recentQuotes.map((q) => {
                const statusInfo = statusMap[q.status] || { label: q.status, className: "bg-gray-100 text-gray-600" };
                const customerName = q.profiles?.name
                  ? q.profiles.name.charAt(0) + "**"
                  : "고객";
                return (
                  <div key={q.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                        {customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customerName} · {PROJECT_TYPES[q.project_type] || q.project_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {q.location}{q.budget ? ` · ${q.budget}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(q.created_at).toLocaleDateString("ko-KR")}
                      </span>
                      {q.status === "PENDING" && (
                        <Link href={`/partner/quotes/new?requestId=${q.id}`}>
                          <button className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            견적서 작성
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/partner/quotes/new">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">견적서 작성</p>
                <p className="text-xs text-gray-500">새 견적서를 작성합니다</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/partner/portfolio/new">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">포트폴리오 등록</p>
                <p className="text-xs text-gray-500">시공 사례를 등록합니다</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/partner/projects">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">프로젝트 관리</p>
                <p className="text-xs text-gray-500">진행 중인 프로젝트를 확인합니다</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
