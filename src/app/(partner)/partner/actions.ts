"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateCompanyProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // 회사 정보 가져오기
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) return { error: "회사 정보를 찾을 수 없습니다." };

  // 이미 대기 중인 요청이 있는지 확인
  const { data: pendingRequest } = await supabase
    .from("company_edit_requests")
    .select("id")
    .eq("company_id", company.id)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingRequest) {
    return { error: "이미 검토 대기 중인 수정 요청이 있습니다. 기존 요청을 취소한 후 다시 시도해주세요." };
  }

  const companyName = formData.get("companyName") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const specialties = JSON.parse(formData.get("specialties") as string || "[]");
  const serviceAreas = JSON.parse(formData.get("serviceAreas") as string || "[]");

  const requestedChanges = {
    company_name: companyName,
    description,
    address,
    phone,
    specialties,
    service_areas: serviceAreas,
  };

  const { error } = await supabase
    .from("company_edit_requests")
    .insert({
      company_id: company.id,
      user_id: user.id,
      requested_changes: requestedChanges,
    });

  if (error) return { error: error.message };
  return { success: true, pending: true };
}

export async function cancelEditRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("company_edit_requests")
    .delete()
    .eq("id", requestId)
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) return { error: error.message };
  return { success: true };
}
