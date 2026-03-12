"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyCompanyApproval } from "@/lib/notifications";
import { redirect } from "next/navigation";

export async function approveCompany(companyId: string) {
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("user_id")
    .eq("id", companyId)
    .single();

  const { error } = await supabase
    .from("companies")
    .update({ is_approved: true, is_verified: true })
    .eq("id", companyId);

  if (error) return { error: error.message };

  if (company) {
    await notifyCompanyApproval(company.user_id, true);
  }

  return { success: true };
}

export async function rejectCompany(companyId: string, reason?: string) {
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("user_id")
    .eq("id", companyId)
    .single();

  const updateData: Record<string, unknown> = { is_approved: false };
  if (reason) updateData.rejection_reason = reason;

  const { error } = await supabase
    .from("companies")
    .update(updateData)
    .eq("id", companyId);

  if (error) return { error: error.message };

  if (company) {
    await notifyCompanyApproval(company.user_id, false, reason);
  }

  return { success: true };
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createClient();

  // Verify current user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "ADMIN")
    return { error: "관리자 권한이 필요합니다." };

  const { error } = await supabase
    .from("profiles")
    .update({ role: role as "CUSTOMER" | "COMPANY" | "ADMIN" })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}
