"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Building2, FileText, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface PendingCompany {
  id: string;
  company_name: string;
  created_at: string;
}

interface RecentActivity {
  type: string;
  text: string;
  time: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function AdminDashboardPage() {
  const [profileCount, setProfileCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [quoteRequestCount, setQuoteRequestCount] = useState(0);
  const [blogPostCount, setBlogPostCount] = useState(0);
  const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [profiles, companies, quoteRequests, blogPosts, pending, recentUsers, recentQuotes, recentBlogs] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("quote_requests").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase
          .from("companies")
          .select("id, company_name, created_at")
          .eq("is_approved", false)
          .order("created_at", { ascending: false }),
        // Recent signups
        supabase
          .from("profiles")
          .select("name, role, created_at")
          .order("created_at", { ascending: false })
          .limit(3),
        // Recent quote requests
        supabase
          .from("quote_requests")
          .select("location, project_type, created_at")
          .order("created_at", { ascending: false })
          .limit(3),
        // Recent blog posts
        supabase
          .from("blog_posts")
          .select("title, views, created_at")
          .order("created_at", { ascending: false })
          .limit(2),
      ]);

      setProfileCount(profiles.count || 0);
      setCompanyCount(companies.count || 0);
      setQuoteRequestCount(quoteRequests.count || 0);
      setBlogPostCount(blogPosts.count || 0);
      setPendingCompanies((pending.data as PendingCompany[]) || []);

      // Build recent activities from real data
      const activities: RecentActivity[] = [];

      (recentUsers.data || []).forEach((u) => {
        const roleName = u.role === "COMPANY" ? "조경회사" : "고객";
        const name = u.name ? u.name.charAt(0) + "**" : "익명";
        activities.push({
          type: "signup",
          text: `새 회원 가입: ${name} (${roleName})`,
          time: u.created_at,
        });
      });

      (recentQuotes.data || []).forEach((q) => {
        activities.push({
          type: "quote",
          text: `새 견적 요청: ${q.location} ${q.project_type}`,
          time: q.created_at,
        });
      });

      (recentBlogs.data || []).forEach((b) => {
        activities.push({
          type: "blog",
          text: `블로그: ${b.title} (조회 ${b.views || 0})`,
          time: b.created_at,
        });
      });

      // Sort by time descending
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivities(activities.slice(0, 8));

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
      label: "총 회원",
      value: profileCount.toLocaleString(),
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "등록 조경회사",
      value: companyCount.toLocaleString(),
      icon: Building2,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "견적 요청",
      value: quoteRequestCount.toLocaleString(),
      icon: FileText,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "블로그 글",
      value: blogPostCount.toLocaleString(),
      icon: DollarSign,
      color: "text-yellow-600 bg-yellow-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-500 mt-1">GardenHome 운영 현황</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">최근 활동</h3>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">아직 활동이 없습니다.</p>
            ) : (
              recentActivities.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <p className="text-sm text-gray-600">{a.text}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{timeAgo(a.time)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">승인 대기</h3>
            <Link href="/admin/companies" className="text-xs text-green-600 hover:underline">전체보기</Link>
          </div>
          <div className="space-y-3">
            {pendingCompanies.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">승인 대기 중인 회사가 없습니다.</p>
            ) : (
              pendingCompanies.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.company_name}</p>
                    <p className="text-xs text-gray-500">
                      조경회사 승인 · {new Date(item.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <Link href="/admin/companies">
                    <button className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      관리
                    </button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
