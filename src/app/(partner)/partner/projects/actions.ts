"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createProject(contractId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) return { error: "회사 정보를 찾을 수 없습니다." };

  // Get contract details
  const { data: contract } = await supabase
    .from("contracts")
    .select("*, quotes(*, quote_requests(project_type, location))")
    .eq("id", contractId)
    .eq("company_id", company.id)
    .single();

  if (!contract) return { error: "계약서를 찾을 수 없습니다." };

  const { data: project, error } = await supabase.from("projects").insert({
    contract_id: contractId,
    company_id: company.id,
    customer_id: contract.customer_id,
    title: contract.content || "조경 시공 프로젝트",
    status: "PREPARING",
    progress: 0,
    start_date: contract.start_date,
    expected_end_date: contract.end_date,
  }).select().single();

  if (error) return { error: error.message };

  // Create default milestones
  const defaultMilestones = [
    { project_id: project.id, title: "사전 준비", description: "자재 준비 및 현장 점검", sort_order: 0 },
    { project_id: project.id, title: "기초 공사", description: "터파기, 배수 시설 설치", sort_order: 1 },
    { project_id: project.id, title: "조경 시공", description: "식재, 구조물 설치", sort_order: 2 },
    { project_id: project.id, title: "마무리", description: "정리 및 최종 점검", sort_order: 3 },
  ];

  await supabase.from("project_milestones").insert(defaultMilestones);

  // Update contract status
  await supabase.from("contracts").update({ status: "COMPLETED" }).eq("id", contractId);

  return { projectId: project.id };
}

export async function updateProjectProgress(projectId: string, progress: number, status?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updateData: Record<string, unknown> = { progress };
  if (status) updateData.status = status;
  if (progress === 100) {
    updateData.status = "COMPLETED";
    updateData.actual_end_date = new Date().toISOString().split("T")[0];
  }

  const { error } = await supabase.from("projects").update(updateData).eq("id", projectId);
  if (error) return { error: error.message };

  // Notify customer about project status change
  if (status) {
    const { data: project } = await supabase
      .from("projects")
      .select("customer_id, title")
      .eq("id", projectId)
      .single();
    if (project) {
      const { notifyProjectUpdate } = await import("@/lib/notifications");
      await notifyProjectUpdate(project.customer_id, project.title, status);
    }
  }

  return { success: true };
}

export async function completeMilestone(milestoneId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("project_milestones")
    .update({ is_completed: true, completed_at: new Date().toISOString() })
    .eq("id", milestoneId);

  if (error) return { error: error.message };

  // Update project progress based on completed milestones
  const { data: milestone } = await supabase.from("project_milestones").select("project_id").eq("id", milestoneId).single();
  if (milestone) {
    const { data: allMilestones } = await supabase.from("project_milestones").select("is_completed").eq("project_id", milestone.project_id);
    if (allMilestones) {
      const completed = allMilestones.filter(m => m.is_completed).length;
      const progress = Math.round((completed / allMilestones.length) * 100);
      await supabase.from("projects").update({
        progress,
        status: progress === 100 ? "INSPECTION" : progress > 0 ? "IN_PROGRESS" : "PREPARING",
      }).eq("id", milestone.project_id);
    }
  }

  return { success: true };
}
