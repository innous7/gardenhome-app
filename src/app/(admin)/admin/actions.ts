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
    // 프로필 역할을 COMPANY로 변경
    await supabase
      .from("profiles")
      .update({ role: "COMPANY" })
      .eq("id", company.user_id);

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

// ── Admin helper ──
async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null as never, error: "로그인이 필요합니다." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN")
    return { supabase: null as never, error: "관리자 권한이 필요합니다." };

  return { supabase, error: null };
}

// ── Company actions ──
export async function updateCompany(
  companyId: string,
  data: {
    company_name: string;
    representative: string;
    address: string;
    phone: string;
    business_number: string;
    established: string | null;
    description: string;
  }
) {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("companies")
    .update(data)
    .eq("id", companyId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteCompany(companyId: string) {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId);

  if (error) return { error: error.message };
  return { success: true };
}

// ── User actions ──
export async function updateUser(
  userId: string,
  data: { name: string; email: string; phone: string }
) {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteUser(userId: string) {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Portfolio actions ──
export async function updatePortfolio(
  portfolioId: string,
  data: {
    title: string;
    excerpt: string;
    location: string;
    budget: string;
    duration: string;
    is_published: boolean;
  }
) {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("portfolios")
    .update(data)
    .eq("id", portfolioId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deletePortfolio(portfolioId: string) {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("portfolios")
    .delete()
    .eq("id", portfolioId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function togglePortfolioPublish(
  portfolioId: string,
  isPublished: boolean
) {
  const { supabase, error: authError } = await verifyAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("portfolios")
    .update({ is_published: !isPublished })
    .eq("id", portfolioId);

  if (error) return { error: error.message };
  return { success: true };
}
