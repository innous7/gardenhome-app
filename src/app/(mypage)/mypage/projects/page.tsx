"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Hammer, CheckCircle, Circle, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PREPARING: { label: "준비중", color: "bg-yellow-100 text-yellow-700" },
  IN_PROGRESS: { label: "시공중", color: "bg-blue-100 text-blue-700" },
  INSPECTION: { label: "검수중", color: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "완료", color: "bg-green-100 text-green-700" },
};

type Project = {
  id: string;
  title: string;
  status: string;
  progress: number;
  start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  created_at: string;
  companies: { company_name: string } | null;
  project_milestones: { id: string; title: string; is_completed: boolean; completed_at: string | null; sort_order: number }[];
};

export default function MypageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("projects")
        .select("*, companies(company_name), project_milestones(id, title, is_completed, completed_at, sort_order)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      setProjects((data as Project[] | null) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">프로젝트 현황</h1>
        <p className="text-gray-500 mt-1">시공 진행 상황을 확인하세요</p>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <Hammer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">진행 중인 프로젝트가 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">계약 체결 후 프로젝트가 생성됩니다</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {projects.map(project => {
            const st = STATUS_MAP[project.status] || STATUS_MAP.PREPARING;
            const sortedMilestones = [...(project.project_milestones || [])].sort((a, b) => a.sort_order - b.sort_order);
            return (
              <Card key={project.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{project.title}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{project.companies?.company_name || "조경회사"}</p>
                    </div>
                    <Badge className={st.color}>{st.label}</Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-500">전체 진행률</span>
                      <span className="font-bold text-green-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {project.start_date ? new Date(project.start_date).toLocaleDateString("ko-KR") : "미정"} ~ {project.expected_end_date ? new Date(project.expected_end_date).toLocaleDateString("ko-KR") : "미정"}</span>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-2">
                    {sortedMilestones.map(ms => (
                      <div key={ms.id} className="flex items-center gap-2.5 text-sm">
                        {ms.is_completed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span className={ms.is_completed ? "text-green-700 line-through" : "text-gray-700"}>{ms.title}</span>
                        {ms.completed_at && <span className="text-xs text-gray-400">{new Date(ms.completed_at).toLocaleDateString("ko-KR")}</span>}
                      </div>
                    ))}
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
