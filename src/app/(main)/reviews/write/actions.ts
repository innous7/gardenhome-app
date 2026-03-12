"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyNewReview } from "@/lib/notifications";

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const companyId = formData.get("companyId") as string;

  // Verify customer has a completed project with this company
  const { data: completedProject } = await supabase
    .from("contracts")
    .select("id")
    .eq("customer_id", user.id)
    .eq("company_id", companyId)
    .eq("status", "COMPLETED")
    .limit(1)
    .single();

  if (!completedProject) {
    return { error: "시공이 완료된 계약이 있는 업체만 리뷰를 작성할 수 있습니다." };
  }

  const rating = Number(formData.get("rating"));
  const designRating = Number(formData.get("designRating"));
  const qualityRating = Number(formData.get("qualityRating"));
  const communicationRating = Number(formData.get("communicationRating"));
  const scheduleRating = Number(formData.get("scheduleRating"));
  const valueRating = Number(formData.get("valueRating"));
  const content = formData.get("content") as string || "";
  const images = JSON.parse(formData.get("images") as string || "[]");

  const { error } = await supabase.from("reviews").insert({
    customer_id: user.id,
    company_id: companyId,
    rating,
    design_rating: designRating,
    quality_rating: qualityRating,
    communication_rating: communicationRating,
    schedule_rating: scheduleRating,
    value_rating: valueRating,
    content,
    images,
  });

  if (error) return { error: error.message };

  // Notify the company about the new review
  const { data: company } = await supabase
    .from("companies")
    .select("user_id")
    .eq("id", companyId)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  if (company) {
    await notifyNewReview(company.user_id, profile?.name || "고객", rating);
  }

  redirect(`/companies/${companyId}`);
}
