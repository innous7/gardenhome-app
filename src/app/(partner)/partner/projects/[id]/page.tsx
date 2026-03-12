"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Circle, Hammer, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { updateProjectProgress, completeMilestone } from "../actions";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PREPARING: { label: "준비중", color: "bg-yellow-100 text-yellow-700" },
  IN_PROGRESS: { label: "시공중", color: "bg-blue-100 text-blue-700" },
  INSPECTION: { label: "검수중", color: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "완료", color: "bg-green-100 text-green-700" },
};

type Milestone = {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  completed_at: string | null;
  sort_order: number;
};

type ProjectDetail = {
  id: string;
  title: string;
  status: string;
  progress: number;
  start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  contracts: { total_amount: number; content: string } | null;
  profiles: { name: string; phone: string | null } | null;
};

export default function PartnerProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: proj } = await supabase
      .from("projects")
      .select("*, contracts(total_amount, content), profiles!projects_customer_id_fkey(name, phone)")
      .eq("id", id)
      .single();
    setProject(proj as ProjectDetail | null);

    const { data: ms } = await supabase
      .from("project_milestones")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true });
    setMilestones((ms as Milestone[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCompleteMilestone = async (milestoneId: string) => {
    const result = await completeMilestone(milestoneId);
    if (!("error" in result)) {
      fetchData();
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!project) return;
    const progress = status === "COMPLETED" ? 100 : project.progress;
    await updateProjectProgress(project.id, progress, status);
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  if (!project) return <div className="text-center py-20 text-gray-400">프로젝트를 찾을 수 없습니다.</div>;

  const st = STATUS_MAP[project.status] || STATUS_MAP.PREPARING;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/partner/projects">
          <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <Badge className={st.color}>{st.label}</Badge>
          </div>
          <p className="text-gray-500 mt-1">고객: {project.profiles?.name || "알 수 없음"}{project.profiles?.phone ? ` · ${project.profiles.phone}` : ""}</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">진행률</h2>
          <span className="text-2xl font-bold text-green-600">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
          <div className="bg-green-600 h-3 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">시작일</span>
            <p className="font-medium mt-0.5">{project.start_date ? new Date(project.start_date).toLocaleDateString("ko-KR") : "미정"}</p>
          </div>
          <div>
            <span className="text-gray-500">예상 완료일</span>
            <p className="font-medium mt-0.5">{project.expected_end_date ? new Date(project.expected_end_date).toLocaleDateString("ko-KR") : "미정"}</p>
          </div>
          <div>
            <span className="text-gray-500">계약 금액</span>
            <p className="font-medium mt-0.5">{project.contracts?.total_amount?.toLocaleString() || 0}원</p>
          </div>
          <div>
            <span className="text-gray-500">실제 완료일</span>
            <p className="font-medium mt-0.5">{project.actual_end_date ? new Date(project.actual_end_date).toLocaleDateString("ko-KR") : "-"}</p>
          </div>
        </div>
      </Card>

      {/* Status Actions */}
      {project.status !== "COMPLETED" && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">상태 변경</h2>
          <div className="flex flex-wrap gap-2">
            {project.status === "PREPARING" && (
              <Button onClick={() => handleStatusChange("IN_PROGRESS")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Hammer className="w-4 h-4 mr-2" /> 시공 시작
              </Button>
            )}
            {project.status === "IN_PROGRESS" && (
              <Button onClick={() => handleStatusChange("INSPECTION")} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                <CheckCircle className="w-4 h-4 mr-2" /> 검수 요청
              </Button>
            )}
            {project.status === "INSPECTION" && (
              <Button onClick={() => handleStatusChange("COMPLETED")} className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
                <CheckCircle className="w-4 h-4 mr-2" /> 시공 완료
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Milestones */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">마일스톤</h2>
        <div className="space-y-3">
          {milestones.map(ms => (
            <div key={ms.id} className={`flex items-start gap-3 p-4 rounded-xl border ${ms.is_completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
              <button
                onClick={() => !ms.is_completed && handleCompleteMilestone(ms.id)}
                disabled={ms.is_completed}
                className="mt-0.5 shrink-0"
              >
                {ms.is_completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 hover:text-green-500 transition-colors" />
                )}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${ms.is_completed ? "text-green-700 line-through" : "text-gray-900"}`}>{ms.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{ms.description}</p>
                {ms.completed_at && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(ms.completed_at).toLocaleDateString("ko-KR")} 완료
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
