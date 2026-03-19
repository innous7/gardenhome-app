"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function applyPartner(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const companyName = formData.get("companyName") as string;
  const businessNumber = formData.get("businessNumber") as string;
  const businessLicenseUrl = formData.get("businessLicenseUrl") as string;

  // 프로필에서 이름, 전화번호 가져오기
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone")
    .eq("id", user.id)
    .single();

  // 이미 회사 등록이 있는지 확인
  const { data: existingCompany } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingCompany) {
    return { error: "이미 파트너 신청이 되어 있습니다." };
  }

  // 회사 레코드 생성
  const { error: companyError } = await supabase.from("companies").insert({
    user_id: user.id,
    company_name: companyName,
    business_number: businessNumber,
    business_license_url: businessLicenseUrl || null,
    representative: profile?.name || "",
    address: "",
    phone: profile?.phone || "",
    is_approved: false,
  });

  if (companyError) {
    return { error: companyError.message };
  }

  // 프로필 역할을 COMPANY로 변경
  await supabase
    .from("profiles")
    .update({ role: "COMPANY" })
    .eq("id", user.id);

  redirect("/register/pending");
}
