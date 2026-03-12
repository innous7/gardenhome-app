import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gardenhome.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/companies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/quote`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/flotren`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Portfolio pages
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id, updated_at")
    .eq("is_published", true);

  const portfolioPages: MetadataRoute.Sitemap = (portfolios || []).map((p) => ({
    url: `${BASE_URL}/explore/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Company pages
  const { data: companies } = await supabase
    .from("companies")
    .select("id, updated_at")
    .eq("is_approved", true);

  const companyPages: MetadataRoute.Sitemap = (companies || []).map((c) => ({
    url: `${BASE_URL}/companies/${c.id}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog pages
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString());

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...portfolioPages, ...companyPages, ...blogPages];
}
