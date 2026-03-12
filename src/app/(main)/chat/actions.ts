"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createOrGetChatRoom(companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("chat_rooms")
    .select("id")
    .eq("customer_id", user.id)
    .eq("company_id", companyId)
    .single();

  if (existing) return { roomId: existing.id };

  const { data: room, error } = await supabase
    .from("chat_rooms")
    .insert({ customer_id: user.id, company_id: companyId })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { roomId: room?.id };
}

export async function sendMessage(roomId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("messages").insert({
    chat_room_id: roomId,
    sender_id: user.id,
    content,
  });

  if (error) return { error: error.message };

  await supabase.from("chat_rooms").update({
    last_message: content,
    last_message_at: new Date().toISOString(),
  }).eq("id", roomId);

  // Notify the other party
  const { data: room } = await supabase
    .from("chat_rooms")
    .select("customer_id, company_id")
    .eq("id", roomId)
    .single();

  if (room) {
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    // Determine who to notify (the other party)
    let targetUserId: string | null = null;
    if (room.customer_id === user.id) {
      // Sender is customer → notify company's user
      const { data: company } = await supabase
        .from("companies")
        .select("user_id")
        .eq("id", room.company_id)
        .single();
      targetUserId = company?.user_id ?? null;
    } else {
      targetUserId = room.customer_id;
    }

    if (targetUserId) {
      const { notifyNewMessage } = await import("@/lib/notifications");
      await notifyNewMessage(targetUserId, senderProfile?.name || "상대방", roomId);
    }
  }

  return { success: true };
}

export async function sendImageMessage(roomId: string, imageUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("messages").insert({
    chat_room_id: roomId,
    sender_id: user.id,
    content: "",
    attachments: [{ type: "image", url: imageUrl }],
  });

  if (error) return { error: error.message };

  await supabase.from("chat_rooms").update({
    last_message: "📷 사진",
    last_message_at: new Date().toISOString(),
  }).eq("id", roomId);

  return { success: true };
}
