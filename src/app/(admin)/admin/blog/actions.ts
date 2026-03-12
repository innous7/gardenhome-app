"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type BlogCategory = Database["public"]["Enums"]["blog_category"];

export async function createBlogPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string || "";
  const excerpt = formData.get("excerpt") as string || "";
  const category = formData.get("category") as BlogCategory;
  const tags = JSON.parse(formData.get("tags") as string || "[]");
  const coverImageUrl = formData.get("coverImageUrl") as string || null;
  const isPublished = formData.get("isPublished") === "true";
  const scheduledAt = formData.get("scheduledAt") as string || null;

  const publishedAt = isPublished
    ? (scheduledAt || new Date().toISOString())
    : null;

  const { error } = await supabase.from("blog_posts").insert({
    author_id: user.id,
    title,
    slug,
    content,
    excerpt,
    cover_image_url: coverImageUrl,
    category,
    tags,
    is_published: isPublished,
    published_at: publishedAt,
  });

  if (error) return { error: error.message };
  redirect("/admin/blog");
}

export async function updateBlogPost(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string || "";
  const excerpt = formData.get("excerpt") as string || "";
  const category = formData.get("category") as BlogCategory;
  const tags = JSON.parse(formData.get("tags") as string || "[]");
  const coverImageUrl = formData.get("coverImageUrl") as string || null;
  const isPublished = formData.get("isPublished") === "true";
  const scheduledAt = formData.get("scheduledAt") as string || null;

  const publishedAt = isPublished
    ? (scheduledAt || new Date().toISOString())
    : null;

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug,
      content,
      excerpt,
      cover_image_url: coverImageUrl,
      category,
      tags,
      is_published: isPublished,
      published_at: publishedAt,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
