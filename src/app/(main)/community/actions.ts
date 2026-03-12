"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const images = JSON.parse(formData.get("images") as string || "[]");
  const tags = JSON.parse(formData.get("tags") as string || "[]");

  const { data, error } = await supabase.from("community_posts").insert({
    author_id: user.id,
    type,
    title,
    content,
    images,
    tags,
  }).select().single();

  if (error) return { error: error.message };
  return { postId: data.id };
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("community_posts").delete().eq("id", postId).eq("author_id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function addComment(postId: string, content: string, parentId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("community_comments").insert({
    post_id: postId,
    author_id: user.id,
    content,
    parent_id: parentId || null,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("community_comments").delete().eq("id", commentId).eq("author_id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: existing } = await supabase
    .from("community_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase.from("community_likes").delete().eq("id", existing.id);
    return { liked: false };
  } else {
    await supabase.from("community_likes").insert({ post_id: postId, user_id: user.id });
    return { liked: true };
  }
}
