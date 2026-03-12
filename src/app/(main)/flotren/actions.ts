"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type FlotrenPlan = Database["public"]["Enums"]["flotren_plan"];

export async function applyFlotren(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = formData.get("plan") as FlotrenPlan;
  const gardenArea = Number(formData.get("gardenArea")) || null;
  const address = formData.get("address") as string || "";
  const phone = formData.get("phone") as string || "";
  const userNotes = (formData.get("notes") as string) || "";

  // Combine address/phone into notes (DB has no separate columns)
  const notesParts = [
    address && `주소: ${address}`,
    phone && `연락처: ${phone}`,
    userNotes,
  ].filter(Boolean);

  // Monthly price based on plan
  const prices: Record<string, number> = {
    BASIC: 99000,
    STANDARD: 199000,
    PREMIUM: 399000,
  };

  // Also save address/phone to profile if not already set
  if (address || phone) {
    const updates: Record<string, string> = {};
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    await supabase.from("profiles").update(updates).eq("id", user.id);
  }

  const { error } = await supabase.from("flotren_subscriptions").insert({
    customer_id: user.id,
    plan,
    garden_area: gardenArea,
    monthly_price: prices[plan] || 99000,
    start_date: new Date().toISOString(),
    status: "ACTIVE",
  });

  if (error) return { error: error.message };
  redirect("/mypage/flotren");
}

export async function pauseSubscription(subscriptionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("flotren_subscriptions")
    .update({ status: "PAUSED" })
    .eq("id", subscriptionId)
    .eq("customer_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function resumeSubscription(subscriptionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("flotren_subscriptions")
    .update({ status: "ACTIVE" })
    .eq("id", subscriptionId)
    .eq("customer_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function cancelSubscription(subscriptionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("flotren_subscriptions")
    .update({ status: "CANCELLED" })
    .eq("id", subscriptionId)
    .eq("customer_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
