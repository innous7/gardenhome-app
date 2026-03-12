"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Hammer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  contracts: { total_amount: number } | null;
  profiles: { name: string } | null;
};

export default function PartnerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: company } = await supabase.from("companies").select("id").eq("user_id", user.id).single();
      if (!company) { setLoading(false); return; }

      const { data } = await supabase
        .from("projects")
        .select("*, contracts(total_amount), profiles!projects_customer_id_fkey(name)")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      setProjects((data as Project[] | null) ?? []);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로젝트 관리</h1>
          <p className="text-gray-500 mt-1">진행 중인 시공 프로젝트를 관리하세요</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <Hammer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">등록된 프로젝트가 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">계약이 체결되면 프로젝트를 생성할 수 있습니다</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => {
            const st = STATUS_MAP[project.status] || STATUS_MAP.PREPARING;
            return (
              <Link key={project.id} href={`/partner/projects/${project.id}`}>
                <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{project.profiles?.name || "고객"}</p>
                    </div>
                    <Badge className={st.color}>{st.label}</Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">진행률</span>
                      <span className="font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{project.start_date ? new Date(project.start_date).toLocaleDateString("ko-KR") : "미정"} ~ {project.expected_end_date ? new Date(project.expected_end_date).toLocaleDateString("ko-KR") : "미정"}</span>
                    {project.contracts && <span>{project.contracts.total_amount.toLocaleString()}원</span>}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
