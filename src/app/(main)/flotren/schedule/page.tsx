"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, MapPin, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

type Visit = {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes: string;
  completed_at: string | null;
  manager_id: string | null;
  manager_profile?: { name: string } | null;
  subscription: {
    plan: string;
    garden_area: number | null;
  } | null;
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  SCHEDULED: { label: "예정", color: "bg-blue-50 text-blue-700", icon: Calendar },
  IN_PROGRESS: { label: "진행 중", color: "bg-yellow-50 text-yellow-700", icon: Clock },
  COMPLETED: { label: "완료", color: "bg-green-50 text-green-700", icon: CheckCircle2 },
  CANCELLED: { label: "취소", color: "bg-red-50 text-red-700", icon: XCircle },
  NO_SHOW: { label: "미방문", color: "bg-gray-100 text-gray-700", icon: AlertCircle },
};

export default function FlotrenSchedulePage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  useEffect(() => {
    const fetchVisits = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get user's subscription IDs
      const { data: subs } = await supabase
        .from("flotren_subscriptions")
        .select("id")
        .eq("customer_id", user.id);

      if (!subs?.length) { setLoading(false); return; }

      const subIds = subs.map(s => s.id);
      const today = new Date().toISOString().slice(0, 10);

      let query = (supabase as any)
        .from("flotren_visits")
        .select("*, flotren_subscriptions(plan, garden_area)")
        .in("subscription_id", subIds);

      if (filter === "upcoming") {
        query = query.gte("scheduled_date", today).order("scheduled_date", { ascending: true });
      } else if (filter === "past") {
        query = query.lt("scheduled_date", today).order("scheduled_date", { ascending: false });
      } else {
        query = query.order("scheduled_date", { ascending: false });
      }

      const { data } = await query;

      // Fetch manager names
      const visitsWithManager: Visit[] = [];
      for (const v of data || []) {
        let managerProfile = null;
        if (v.manager_id) {
          const { data: mp } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", v.manager_id)
            .single();
          managerProfile = mp;
        }
        visitsWithManager.push({
          ...v,
          manager_profile: managerProfile,
          subscription: v.flotren_subscriptions as Visit["subscription"],
        });
      }

      setVisits(visitsWithManager);
      setLoading(false);
    };
    fetchVisits();
  }, [filter]);

  if (loading) {
    return <div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/mypage/flotren"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">방문 스케줄</h1>
            <p className="text-gray-500 text-sm mt-0.5">Flotren 조경관리 방문 일정</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "upcoming" as const, label: "예정" },
            { key: "past" as const, label: "지난 방문" },
            { key: "all" as const, label: "전체" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Visit List */}
        {visits.length > 0 ? (
          <div className="space-y-3">
            {visits.map(visit => {
              const cfg = statusConfig[visit.status] || statusConfig.SCHEDULED;
              const Icon = cfg.icon;
              const date = new Date(visit.scheduled_date);
              const isToday = visit.scheduled_date === new Date().toISOString().slice(0, 10);

              return (
                <Card key={visit.id} className={`p-5 ${isToday ? "ring-2 ring-green-500" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isToday ? "bg-green-100" : "bg-gray-100"}`}>
                        <Icon className={`w-5 h-5 ${isToday ? "text-green-600" : "text-gray-500"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
                          </span>
                          {isToday && <Badge className="bg-green-50 text-green-700 text-xs">오늘</Badge>}
                          <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{visit.scheduled_time}</span>
                          {visit.manager_profile && (
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{visit.manager_profile.name} 관리사</span>
                          )}
                          {visit.subscription && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {visit.subscription.plan} 플랜
                              {visit.subscription.garden_area && ` · ${visit.subscription.garden_area}평`}
                            </span>
                          )}
                        </div>
                        {visit.notes && <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2">{visit.notes}</p>}
                      </div>
                    </div>
                    {visit.status === "COMPLETED" && (
                      <Link href={`/flotren/reports?visitId=${visit.id}`}>
                        <Button variant="outline" size="sm" className="rounded-lg text-xs">
                          리포트 보기
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === "upcoming" ? "예정된 방문이 없습니다" : "방문 기록이 없습니다"}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Flotren 구독을 시작하시면 관리사 방문 스케줄이 자동으로 생성됩니다.
            </p>
            <Link href="/flotren">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl">구독 알아보기</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
