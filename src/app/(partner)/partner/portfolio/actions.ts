"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type ProjectType = Database["public"]["Enums"]["project_type"];
type GardenStyle = Database["public"]["Enums"]["garden_style"];

export async function createPortfolio(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user's company
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) return { error: "회사 정보를 찾을 수 없습니다." };

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string || "";
  const projectType = formData.get("projectType") as ProjectType;
  const style = formData.get("style") as GardenStyle;
  const location = formData.get("location") as string;
  const area = Number(formData.get("area")) || null;
  const duration = formData.get("duration") as string || null;
  const budget = formData.get("budget") as string || null;
  const coverImageUrl = formData.get("coverImageUrl") as string || null;
  const plants = JSON.parse(formData.get("plants") as string || "[]");
  const materials = JSON.parse(formData.get("materials") as string || "[]");
  const beforeImages = JSON.parse(formData.get("beforeImages") as string || "[]");
  const afterImages = JSON.parse(formData.get("afterImages") as string || "[]");

  const { error } = await supabase.from("portfolios").insert({
    company_id: company.id,
    title,
    excerpt,
    content,
    project_type: projectType,
    style,
    location,
    area,
    duration,
    budget,
    cover_image_url: coverImageUrl,
    plants,
    materials,
    before_images: beforeImages,
    after_images: afterImages,
    is_published: formData.get("isDraft") !== "true",
  });

  if (error) return { error: error.message };
  redirect("/partner/portfolio");
}

export async function updatePortfolio(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) return { error: "회사 정보를 찾을 수 없습니다." };

  // Verify ownership
  const { data: existing } = await supabase
    .from("portfolios")
    .select("id")
    .eq("id", id)
    .eq("company_id", company.id)
    .single();

  if (!existing) return { error: "포트폴리오를 찾을 수 없습니다." };

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string || "";
  const projectType = formData.get("projectType") as ProjectType;
  const style = formData.get("style") as GardenStyle;
  const location = formData.get("location") as string;
  const area = Number(formData.get("area")) || null;
  const duration = formData.get("duration") as string || null;
  const budget = formData.get("budget") as string || null;
  const coverImageUrl = formData.get("coverImageUrl") as string || null;
  const plants = JSON.parse(formData.get("plants") as string || "[]");
  const materials = JSON.parse(formData.get("materials") as string || "[]");
  const beforeImages = JSON.parse(formData.get("beforeImages") as string || "[]");
  const afterImages = JSON.parse(formData.get("afterImages") as string || "[]");
  const isPublished = formData.get("isPublished") !== "false";

  const { error } = await supabase.from("portfolios").update({
    title, excerpt, content,
    project_type: projectType,
    style, location, area, duration, budget,
    cover_image_url: coverImageUrl,
    plants, materials,
    before_images: beforeImages,
    after_images: afterImages,
    is_published: isPublished,
  }).eq("id", id);

  if (error) return { error: error.message };
  redirect("/partner/portfolio");
}

export async function deletePortfolio(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) return { error: "회사 정보를 찾을 수 없습니다." };

  const { error } = await supabase
    .from("portfolios")
    .delete()
    .eq("id", id)
    .eq("company_id", company.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function togglePortfolioPublish(id: string, isPublished: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) return { error: "회사 정보를 찾을 수 없습니다." };

  const { error } = await supabase
    .from("portfolios")
    .update({ is_published: isPublished })
    .eq("id", id)
    .eq("company_id", company.id);

  if (error) return { error: error.message };
  return { success: true };
}
