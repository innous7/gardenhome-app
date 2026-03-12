"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyQuoteSent } from "@/lib/notifications";
import type { Database } from "@/types/supabase";

export async function createQuote(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id, company_name")
    .eq("user_id", user.id)
    .single();

  if (!company) return { error: "회사 정보를 찾을 수 없습니다." };

  const quoteRequestId = formData.get("quoteRequestId") as string;
  const customerId = formData.get("customerId") as string;
  const items = JSON.parse(formData.get("items") as string || "[]");
  const subtotal = Number(formData.get("subtotal"));
  const tax = Number(formData.get("tax"));
  const total = Number(formData.get("total"));
  const validUntil = formData.get("validUntil") as string || null;
  const notes = formData.get("notes") as string || "";
  const paymentTerms = formData.get("paymentTerms") as string || "";
  const isDraft = formData.get("isDraft") === "true";

  const { error } = await supabase.from("quotes").insert({
    quote_request_id: quoteRequestId || "",
    company_id: company.id,
    customer_id: customerId,
    items,
    subtotal,
    tax,
    total,
    valid_until: validUntil,
    notes,
    payment_terms: paymentTerms,
    status: isDraft ? "DRAFT" : "SENT",
  });

  if (error) return { error: error.message };

  // If not draft, notify customer
  if (!isDraft && quoteRequestId) {
    const { data: request } = await supabase
      .from("quote_requests")
      .select("customer_id")
      .eq("id", quoteRequestId)
      .single();
    if (request) {
      await notifyQuoteSent(request.customer_id, company.company_name, quoteRequestId);
      // Update quote request status to MATCHED
      await supabase.from("quote_requests").update({ status: "MATCHED" }).eq("id", quoteRequestId).eq("status", "PENDING");
    }
  }

  redirect("/partner/quotes");
}

type QuoteStatus = Database["public"]["Enums"]["quote_status"];

export async function updateQuoteStatus(quoteId: string, status: QuoteStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id, company_name")
    .eq("user_id", user.id)
    .single();

  if (!company) return { error: "회사 정보를 찾을 수 없습니다." };

  const { error } = await supabase
    .from("quotes")
    .update({ status })
    .eq("id", quoteId)
    .eq("company_id", company.id);

  if (error) return { error: error.message };

  // Notify customer when quote is sent
  if (status === "SENT") {
    const { data: quote } = await supabase
      .from("quotes")
      .select("quote_request_id, customer_id")
      .eq("id", quoteId)
      .single();
    if (quote?.customer_id) {
      await notifyQuoteSent(quote.customer_id, company.company_name, quote.quote_request_id || quoteId);
      if (quote.quote_request_id) {
        await supabase.from("quote_requests").update({ status: "MATCHED" }).eq("id", quote.quote_request_id).eq("status", "PENDING");
      }
    }
  }

  return { success: true };
}

export async function deleteQuote(quoteId: string) {
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
    .from("quotes")
    .delete()
    .eq("id", quoteId)
    .eq("company_id", company.id);

  if (error) return { error: error.message };
  return { success: true };
}
