"use server";

import { createClient } from "@/lib/supabase/server";

export async function replyToReview(reviewId: string, reply: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ company_reply: reply })
    .eq("id", reviewId);

  if (error) return { error: error.message };
  return { success: true };
}
