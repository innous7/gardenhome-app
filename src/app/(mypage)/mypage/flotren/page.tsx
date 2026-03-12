"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sprout, ArrowRight, Calendar, CreditCard, CalendarDays, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { FLOTREN_PLANS } from "@/lib/constants";
import { pauseSubscription, resumeSubscription, cancelSubscription } from "@/app/(main)/flotren/actions";

type Subscription = {
  id: string;
  plan: string;
  monthly_price: number;
  start_date: string;
  garden_area: number | null;
  status: string;
};

const statusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "구독 중", color: "bg-green-50 text-green-700" },
  PAUSED: { label: "일시정지", color: "bg-yellow-50 text-yellow-700" },
  CANCELLED: { label: "취소됨", color: "bg-red-50 text-red-700" },
};

export default function CustomerFlotrenPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchSubs = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("flotren_subscriptions")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });
    setSubscriptions((data as Subscription[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleAction = async (action: (id: string) => Promise<{ error?: string; success?: boolean }>, subscriptionId: string) => {
    setActionLoading(subscriptionId);
    setError("");
    const result = await action(subscriptionId);
    if (result?.error) {
      setError(result.error);
    }
    await fetchSubs();
    setActionLoading(null);
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
          <h1 className="text-2xl font-bold text-gray-900">조경관리 구독</h1>
          <p className="text-gray-500 mt-1">Flotren 조경관리 서비스 현황</p>
        </div>
        {subscriptions.some(s => s.status === "ACTIVE") && (
          <div className="flex gap-2">
            <Link href="/flotren/schedule">
              <Button variant="outline" size="sm" className="rounded-lg">
                <CalendarDays className="w-4 h-4 mr-1" />방문 스케줄
              </Button>
            </Link>
            <Link href="/flotren/reports">
              <Button variant="outline" size="sm" className="rounded-lg">
                <FileText className="w-4 h-4 mr-1" />관리 리포트
              </Button>
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      {subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const planKey = sub.plan as keyof typeof FLOTREN_PLANS;
            const planInfo = FLOTREN_PLANS[planKey];
            const status = statusMap[sub.status] || statusMap.ACTIVE;

            return (
              <Card key={sub.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                      <Sprout className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {planInfo?.name || sub.plan} 플랜
                        </h3>
                        <Badge className={`text-xs ${status.color}`}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {planInfo?.visits || "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {sub.monthly_price.toLocaleString()}원/월
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        시작일: {new Date(sub.start_date).toLocaleDateString("ko-KR")}
                        {sub.garden_area && ` · 면적: ${sub.garden_area}평`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    {sub.status === "ACTIVE" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-yellow-700 border-yellow-300 hover:bg-yellow-50 rounded-lg"
                          disabled={actionLoading === sub.id}
                          onClick={() => handleAction(pauseSubscription, sub.id)}
                        >
                          일시정지
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-700 border-red-300 hover:bg-red-50 rounded-lg"
                          disabled={actionLoading === sub.id}
                          onClick={() => handleAction(cancelSubscription, sub.id)}
                        >
                          구독 취소
                        </Button>
                      </>
                    )}
                    {sub.status === "PAUSED" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-700 border-green-300 hover:bg-green-50 rounded-lg"
                          disabled={actionLoading === sub.id}
                          onClick={() => handleAction(resumeSubscription, sub.id)}
                        >
                          재개
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-700 border-red-300 hover:bg-red-50 rounded-lg"
                          disabled={actionLoading === sub.id}
                          onClick={() => handleAction(cancelSubscription, sub.id)}
                        >
                          구독 취소
                        </Button>
                      </>
                    )}
                    {sub.status === "CANCELLED" && (
                      <span className="text-sm text-gray-400">취소됨</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">아직 구독 중인 플랜이 없습니다</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Flotren 조경관리 서비스로 전문 관리사가 정기적으로 방문하여 정원을 관리해드립니다.
          </p>
          <Link href="/flotren">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6">
              구독 플랜 알아보기 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
