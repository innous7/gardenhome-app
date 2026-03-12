"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleScrap(portfolioId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  // Check if already scrapped
  const { data: existing } = await supabase
    .from("scraps")
    .select("id")
    .eq("user_id", user.id)
    .eq("portfolio_id", portfolioId)
    .single();

  if (existing) {
    // Remove scrap
    await supabase.from("scraps").delete().eq("id", existing.id);
    return { scrapped: false };
  } else {
    // Add scrap
    await supabase.from("scraps").insert({ user_id: user.id, portfolio_id: portfolioId });
    return { scrapped: true };
  }
}

export async function getUserScraps() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("scraps")
    .select("portfolio_id")
    .eq("user_id", user.id);

  return (data ?? []).map(s => s.portfolio_id);
}
