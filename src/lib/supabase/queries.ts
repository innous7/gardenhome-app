import { createClient } from "./server";
import type { Tables } from "@/types/supabase";

// ── Companies ──────────────────────────────────────────────
export async function getCompanies() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("is_approved", true)
    .order("rating", { ascending: false });
  return data ?? [];
}

export async function getCompanyById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function getAllCompanies() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ── Portfolios ─────────────────────────────────────────────
export async function getPortfolios() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("portfolios")
    .select("*, companies(id, company_name)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getPortfolioById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("portfolios")
    .select("*, companies(id, company_name, logo_url, rating, review_count)")
    .eq("id", id)
    .single();
  return data;
}

export async function getPortfoliosByCompany(companyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("portfolios")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ── Blog Posts ──────────────────────────────────────────────
export async function getBlogPosts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  return data ?? [];
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function incrementBlogViews(slug: string) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, views")
    .eq("slug", slug)
    .single();
  if (post) {
    await supabase
      .from("blog_posts")
      .update({ views: (post.views || 0) + 1 })
      .eq("id", post.id);
  }
}

export async function getAllBlogPosts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ── Reviews ────────────────────────────────────────────────
export async function getReviewsByCompany(companyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, profiles!reviews_customer_id_fkey(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ── Quote Requests ─────────────────────────────────────────
export async function getQuoteRequestsByCustomer(customerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quote_requests")
    .select("*, quotes(*, companies(company_name))")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getQuoteRequestsForCompany(companyId: string) {
  const supabase = await createClient();
  // Show PENDING requests (available for all approved companies to bid on)
  // and requests that already have quotes from this company
  const { data: ownQuotes } = await supabase
    .from("quotes")
    .select("quote_request_id")
    .eq("company_id", companyId);

  const ownRequestIds = (ownQuotes ?? []).map(q => q.quote_request_id).filter(Boolean);

  const { data } = await supabase
    .from("quote_requests")
    .select("*, profiles!quote_requests_customer_id_fkey(name)")
    .or(`status.eq.PENDING${ownRequestIds.length > 0 ? `,id.in.(${ownRequestIds.join(",")})` : ""}`)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ── Quotes ─────────────────────────────────────────────────
export async function getQuotesByCompany(companyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select("*, quote_requests(project_type, location), profiles!quotes_customer_id_fkey(name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ── Contracts ──────────────────────────────────────────────
export async function getContractsByCustomer(customerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contracts")
    .select("*, companies(company_name)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ── Flotren Subscriptions ──────────────────────────────────
export async function getFlotrenByCustomer(customerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("flotren_subscriptions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ── Admin Stats ────────────────────────────────────────────
export async function getAdminStats() {
  const supabase = await createClient();
  const [profiles, companies, contracts, blogPosts] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("contracts").select("id", { count: "exact", head: true }),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }),
  ]);
  return {
    userCount: profiles.count ?? 0,
    companyCount: companies.count ?? 0,
    contractCount: contracts.count ?? 0,
    blogPostCount: blogPosts.count ?? 0,
  };
}

// ── Users (Admin) ──────────────────────────────────────────
export async function getAllUsers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}
