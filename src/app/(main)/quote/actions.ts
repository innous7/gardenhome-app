"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyNewQuoteRequest } from "@/lib/notifications";
import { PROJECT_TYPES } from "@/lib/constants";
import type { Database } from "@/types/supabase";

type ProjectType = Database["public"]["Enums"]["project_type"];
type GardenStyle = Database["public"]["Enums"]["garden_style"];

export async function submitQuoteRequest(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const projectType = formData.get("projectType") as ProjectType;
  const style = (formData.get("style") as GardenStyle) || null;
  const location = formData.get("location") as string;
  const area = Number(formData.get("area"));
  const budget = (formData.get("budget") as string) || null;
  const preferredSchedule =
    (formData.get("preferredSchedule") as string) || null;
  const requirements = (formData.get("requirements") as string) || "";
  const extras = JSON.parse((formData.get("extras") as string) || "[]");
  const currentPhotos = JSON.parse((formData.get("currentPhotos") as string) || "[]");
  const referenceImages = JSON.parse((formData.get("referenceImages") as string) || "[]");

  const { data: inserted, error } = await supabase.from("quote_requests").insert({
    customer_id: user.id,
    project_type: projectType,
    style: style,
    location,
    area,
    budget,
    preferred_schedule: preferredSchedule,
    requirements,
    extras,
    current_photos: currentPhotos,
    reference_images: referenceImages,
  }).select("id").single();

  if (error) {
    return { error: error.message };
  }

  // Notify all approved companies about the new quote request
  const projectTypeLabel = PROJECT_TYPES[projectType] || projectType;
  await notifyNewQuoteRequest(inserted.id, projectTypeLabel, location);

  redirect("/mypage/quotes?submitted=true");
}
