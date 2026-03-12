"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, FileText, UserPlus, Plus, Sprout, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { FLOTREN_PLANS } from "@/lib/constants";

type Subscription = {
  id: string;
  plan: string;
  monthly_price: number;
  start_date: string;
  garden_area: number | null;
  status: string;
  customer_id: string;
  profiles: { name: string; email: string; phone: string | null } | null;
};

type Manager = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  specialties: string[];
  service_areas: string[];
  max_subscriptions: number;
  active_subscriptions: number;
  is_active: boolean;
};

const statusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "구독 중", color: "bg-green-50 text-green-700" },
  PAUSED: { label: "일시정지", color: "bg-yellow-50 text-yellow-700" },
  CANCELLED: { label: "취소됨", color: "bg-red-50 text-red-700" },
};

export default function AdminFlotrenPage() {
  const [tab, setTab] = useState<"subscriptions" | "managers" | "schedule">("subscriptions");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddManager, setShowAddManager] = useState(false);
  const [newManager, setNewManager] = useState({ name: "", phone: "", specialties: "", areas: "" });
  const [scheduleForm, setScheduleForm] = useState({ subscriptionId: "", managerId: "", date: "", time: "10:00", notes: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();

    const [subsRes, mgrsRes] = await Promise.all([
      supabase.from("flotren_subscriptions")
        .select("*, profiles!flotren_subscriptions_customer_id_fkey(name, email, phone)")
        .order("created_at", { ascending: false }),
      (supabase as any).from("flotren_managers")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    setSubscriptions((subsRes.data as Subscription[]) || []);
    setManagers((mgrsRes.data as Manager[]) || []);
    setLoading(false);
  };

  const handleAddManager = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (supabase as any).from("flotren_managers").insert({
      user_id: user.id,
      name: newManager.name,
      phone: newManager.phone,
      specialties: newManager.specialties.split(",").map(s => s.trim()).filter(Boolean),
      service_areas: newManager.areas.split(",").map(s => s.trim()).filter(Boolean),
    });

    setShowAddManager(false);
    setNewManager({ name: "", phone: "", specialties: "", areas: "" });
    fetchData();
  };

  const handleCreateVisit = async () => {
    const supabase = createClient();

    await (supabase as any).from("flotren_visits").insert({
      subscription_id: scheduleForm.subscriptionId,
      manager_id: scheduleForm.managerId || null,
      scheduled_date: scheduleForm.date,
      scheduled_time: scheduleForm.time,
      notes: scheduleForm.notes,
      status: "SCHEDULED",
    });

    setScheduleForm({ subscriptionId: "", managerId: "", date: "", time: "10:00", notes: "" });
    alert("방문 일정이 생성되었습니다.");
  };

  const handleAssignManager = async (subscriptionId: string, managerId: string) => {
    const supabase = createClient();

    await (supabase as any).from("flotren_assignments").upsert({
      subscription_id: subscriptionId,
      manager_id: managerId,
      is_active: true,
    });

    alert("관리사가 배정되었습니다.");
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  }

  const activeSubs = subscriptions.filter(s => s.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Flotren 관리</h1>
        <p className="text-gray-500 mt-1">조경관리 구독 서비스 운영</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "총 구독", value: subscriptions.length, icon: Sprout, color: "text-green-600 bg-green-50" },
          { label: "활성 구독", value: activeSubs.length, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "관리사", value: managers.filter(m => m.is_active).length, icon: UserPlus, color: "text-purple-600 bg-purple-50" },
          { label: "월 매출", value: `${activeSubs.reduce((sum, s) => sum + s.monthly_price, 0).toLocaleString()}원`, icon: FileText, color: "text-amber-600 bg-amber-50" },
        ].map(stat => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { key: "subscriptions" as const, label: "구독 현황", icon: Sprout },
          { key: "managers" as const, label: "관리사 관리", icon: Users },
          { key: "schedule" as const, label: "스케줄 생성", icon: Calendar },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-green-50 text-green-700" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Subscriptions Tab */}
      {tab === "subscriptions" && (
        <div className="space-y-3">
          {subscriptions.map(sub => {
            const planKey = sub.plan as keyof typeof FLOTREN_PLANS;
            const planInfo = FLOTREN_PLANS[planKey];
            const st = statusMap[sub.status] || statusMap.ACTIVE;

            return (
              <Card key={sub.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <Sprout className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{sub.profiles?.name}</span>
                        <Badge className={`text-xs ${st.color}`}>{st.label}</Badge>
                        <Badge className="text-xs bg-gray-100 text-gray-700">{planInfo?.name} 플랜</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {sub.profiles?.email} · {sub.monthly_price.toLocaleString()}원/월
                        {sub.garden_area && ` · ${sub.garden_area}평`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.status === "ACTIVE" && managers.length > 0 && (
                      <select
                        onChange={e => e.target.value && handleAssignManager(sub.id, e.target.value)}
                        className="text-sm border rounded-lg px-2 py-1"
                        defaultValue=""
                      >
                        <option value="" disabled>관리사 배정</option>
                        {managers.filter(m => m.is_active).map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </Card>
            );
          })}
          {subscriptions.length === 0 && (
            <Card className="p-12 text-center text-gray-400">아직 구독이 없습니다.</Card>
          )}
        </div>
      )}

      {/* Managers Tab */}
      {tab === "managers" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddManager(!showAddManager)} className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-1" />관리사 추가
            </Button>
          </div>

          {showAddManager && (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">새 관리사 등록</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">이름</label>
                  <input value={newManager.name} onChange={e => setNewManager({ ...newManager, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="홍길동" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">연락처</label>
                  <input value={newManager.phone} onChange={e => setNewManager({ ...newManager, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="010-1234-5678" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">전문 분야 (쉼표 구분)</label>
                  <input value={newManager.specialties} onChange={e => setNewManager({ ...newManager, specialties: e.target.value })} className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="잔디관리, 전정, 수경시설" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">서비스 지역 (쉼표 구분)</label>
                  <input value={newManager.areas} onChange={e => setNewManager({ ...newManager, areas: e.target.value })} className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="서울, 경기" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddManager(false)} className="rounded-lg">취소</Button>
                <Button onClick={handleAddManager} disabled={!newManager.name || !newManager.phone} className="bg-green-600 hover:bg-green-700 text-white rounded-lg">등록</Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {managers.map(mgr => (
              <Card key={mgr.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{mgr.name}</span>
                        <Badge className={`text-xs ${mgr.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {mgr.is_active ? "활동 중" : "비활동"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {mgr.phone} · 담당: {mgr.active_subscriptions}/{mgr.max_subscriptions}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {(mgr.specialties as string[]).map((s, i) => (
                          <Badge key={i} className="text-[10px] bg-gray-100 text-gray-600 font-normal">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {managers.length === 0 && (
              <Card className="p-12 text-center text-gray-400">등록된 관리사가 없습니다.</Card>
            )}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {tab === "schedule" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">방문 스케줄 생성</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">구독 고객</label>
              <select
                value={scheduleForm.subscriptionId}
                onChange={e => setScheduleForm({ ...scheduleForm, subscriptionId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="">선택하세요</option>
                {activeSubs.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.profiles?.name} ({FLOTREN_PLANS[s.plan as keyof typeof FLOTREN_PLANS]?.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">담당 관리사</label>
              <select
                value={scheduleForm.managerId}
                onChange={e => setScheduleForm({ ...scheduleForm, managerId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="">미정</option>
                {managers.filter(m => m.is_active).map(m => (
                  <option key={m.id} value={m.user_id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">방문 날짜</label>
              <input
                type="date"
                value={scheduleForm.date}
                onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">방문 시간</label>
              <input
                type="time"
                value={scheduleForm.time}
                onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-600">메모</label>
              <textarea
                value={scheduleForm.notes}
                onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                rows={2}
                placeholder="방문 시 참고사항..."
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleCreateVisit}
              disabled={!scheduleForm.subscriptionId || !scheduleForm.date}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              <Calendar className="w-4 h-4 mr-1" />스케줄 생성
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
