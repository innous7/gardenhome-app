"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type ContractStatus = Database["public"]["Enums"]["contract_status"];

export async function createContract(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quoteId = formData.get("quoteId") as string;

  // Get quote details
  const { data: quote } = await supabase
    .from("quotes")
    .select("*, companies(id, company_name), quote_requests(project_type, location)")
    .eq("id", quoteId)
    .single();

  if (!quote) return { error: "견적서를 찾을 수 없습니다." };

  const startDate = formData.get("startDate") as string || null;
  const endDate = formData.get("endDate") as string || null;
  const warrantyTerms = formData.get("warrantyTerms") as string || "시공 완료일로부터 1년";
  const specialTerms = formData.get("specialTerms") as string || "";

  const { data: contract, error } = await supabase.from("contracts").insert({
    quote_id: quoteId,
    company_id: quote.company_id,
    customer_id: user.id,
    content: `${(quote.companies as { id: string; company_name: string } | null)?.company_name || "조경회사"}와(과) 조경 시공 계약`,
    start_date: startDate,
    end_date: endDate,
    total_amount: quote.total,
    payment_schedule: [
      { label: "계약금 (30%)", amount: Math.round(quote.total * 0.3), status: "PENDING" },
      { label: "중도금 (40%)", amount: Math.round(quote.total * 0.4), status: "PENDING" },
      { label: "잔금 (30%)", amount: Math.round(quote.total * 0.3), status: "PENDING" },
    ],
    warranty_terms: warrantyTerms,
    special_terms: specialTerms,
    status: "DRAFT",
  }).select().single();

  if (error) return { error: error.message };
  return { contractId: contract?.id };
}

export async function signContract(contractId: string, signature: string, role: "customer" | "company") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const field = role === "customer" ? "customer_signature" : "company_signature";

  const { error } = await supabase
    .from("contracts")
    .update({ [field]: signature })
    .eq("id", contractId);

  if (error) return { error: error.message };

  // Check if both signatures exist now
  const { data: contract } = await supabase
    .from("contracts")
    .select("customer_signature, company_signature")
    .eq("id", contractId)
    .single();

  // Notify the other party about the signature
  const { data: fullContract } = await supabase
    .from("contracts")
    .select("customer_id, company_id, customer_signature, company_signature, quote_id, total_amount, start_date, end_date")
    .eq("id", contractId)
    .single();

  if (fullContract) {
    const { data: signerProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();
    const signerName = signerProfile?.name || "상대방";

    // Determine target user for notification
    let targetUserId: string | null = null;
    if (role === "customer") {
      const { data: company } = await supabase
        .from("companies")
        .select("user_id")
        .eq("id", fullContract.company_id)
        .single();
      targetUserId = company?.user_id ?? null;
    } else {
      targetUserId = fullContract.customer_id;
    }

    if (targetUserId) {
      const { notifyContractSigned } = await import("@/lib/notifications");
      await notifyContractSigned(targetUserId, signerName, contractId);
    }

    if (fullContract.customer_signature && fullContract.company_signature) {
      // Both signed - auto complete
      await supabase
        .from("contracts")
        .update({ status: "SIGNED" })
        .eq("id", contractId);

      // Auto-create project from the signed contract
      const { data: quote } = await supabase
        .from("quotes")
        .select("quote_request_id, quote_requests(project_type, location)")
        .eq("id", fullContract.quote_id)
        .single();

      const qr = quote?.quote_requests as { project_type: string; location: string } | null;

      await supabase.from("projects").insert({
        contract_id: contractId,
        company_id: fullContract.company_id,
        customer_id: fullContract.customer_id,
        title: qr ? `${qr.location} ${qr.project_type} 프로젝트` : "조경 시공 프로젝트",
        status: "PLANNED",
        start_date: fullContract.start_date,
        end_date: fullContract.end_date,
      });
    } else {
      await supabase
        .from("contracts")
        .update({ status: "PENDING_SIGN" })
        .eq("id", contractId);
    }
  }

  return { success: true };
}

export async function updateContractStatus(contractId: string, status: ContractStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contracts")
    .update({ status })
    .eq("id", contractId);

  if (error) return { error: error.message };
  return { success: true };
}
