"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignaturePad } from "@/components/ui/signature-pad";
import { createClient } from "@/lib/supabase/client";
import { signContract } from "../actions";

type PaymentItem = { label: string; amount: number; status: string };

type ContractDetail = {
  id: string;
  status: string;
  total_amount: number;
  start_date: string | null;
  end_date: string | null;
  content: string;
  payment_schedule: PaymentItem[];
  warranty_terms: string;
  special_terms: string;
  customer_signature: string | null;
  company_signature: string | null;
  created_at: string;
  customer_id: string;
  company_id: string;
  companies: { company_name: string; representative: string; address: string; phone: string } | null;
  profiles: { name: string; email: string } | null;
  quotes: { total: number; items: any } | null;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "초안", color: "bg-gray-100 text-gray-700" },
  REVIEW: { label: "검토 중", color: "bg-yellow-50 text-yellow-700" },
  PENDING_SIGN: { label: "서명 대기", color: "bg-blue-50 text-blue-700" },
  SIGNED: { label: "계약 완료", color: "bg-green-50 text-green-700" },
  COMPLETED: { label: "시공 완료", color: "bg-purple-50 text-purple-700" },
  CANCELLED: { label: "취소", color: "bg-red-50 text-red-700" },
};

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSignPad, setShowSignPad] = useState(false);
  const [userRole, setUserRole] = useState<"customer" | "company">("customer");

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data } = await supabase
        .from("contracts")
        .select("*, companies(company_name, representative, address, phone), profiles!contracts_customer_id_fkey(name, email), quotes(total, items)")
        .eq("id", id)
        .single();

      if (data) {
        setContract(data as any);
        // Determine role
        if (user) {
          if (data.customer_id === user.id) setUserRole("customer");
          else {
            const { data: company } = await supabase.from("companies").select("id").eq("user_id", user.id).single();
            if (company && company.id === data.company_id) setUserRole("company");
          }
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleSign = async (dataUrl: string) => {
    if (!contract) return;
    const result = await signContract(contract.id, dataUrl, userRole);
    if (result.success) {
      // Refresh
      const supabase = createClient();
      const { data } = await supabase.from("contracts").select("*, companies(company_name, representative, address, phone), profiles!contracts_customer_id_fkey(name, email), quotes(total, items)").eq("id", id).single();
      if (data) setContract(data as any);
      setShowSignPad(false);
    }
  };

  if (loading) return <div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  if (!contract) return <div className="pt-20 text-center py-20 text-gray-400">계약서를 찾을 수 없습니다.</div>;

  const payments = (contract.payment_schedule as PaymentItem[]) || [];
  const mySignature = userRole === "customer" ? contract.customer_signature : contract.company_signature;
  const st = statusLabels[contract.status] || statusLabels.DRAFT;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div className="flex items-center gap-4">
            <Link href="/mypage/contracts"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">계약서</h1>
              <Badge className={`text-xs mt-1 ${st.color}`}>{st.label}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => {
              import("@/lib/contract-pdf").then(({ generateContractPDF }) => {
                generateContractPDF({
                  id: contract.id,
                  status: contract.status,
                  total_amount: contract.total_amount,
                  start_date: contract.start_date,
                  end_date: contract.end_date,
                  content: contract.content,
                  payment_schedule: payments,
                  warranty_terms: contract.warranty_terms,
                  special_terms: contract.special_terms,
                  customer_signature: contract.customer_signature,
                  company_signature: contract.company_signature,
                  created_at: contract.created_at,
                  customer_name: contract.profiles?.name || "",
                  customer_email: contract.profiles?.email || "",
                  company_name: contract.companies?.company_name || "",
                  company_address: contract.companies?.address || "",
                  company_representative: contract.companies?.representative || "",
                  company_phone: contract.companies?.phone || "",
                });
              });
            }}><Download className="w-4 h-4 mr-2" />PDF 다운로드</Button>
            <Button variant="outline" className="rounded-xl" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />인쇄</Button>
          </div>
        </div>

        {/* Contract Document */}
        <div className="bg-white rounded-xl border p-8 print:border-0 print:p-0 space-y-8">
          <div className="text-center border-b pb-6">
            <h2 className="text-2xl font-bold text-gray-900">조 경 시 공 계 약 서</h2>
            <p className="text-sm text-gray-500 mt-2">계약번호: {contract.id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">발주자 (갑)</h3>
              <p className="font-medium text-gray-900">{contract.profiles?.name}</p>
              <p className="text-sm text-gray-500">{contract.profiles?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">수급자 (을)</h3>
              <p className="font-medium text-gray-900">{contract.companies?.company_name}</p>
              <p className="text-sm text-gray-500">{contract.companies?.address}</p>
              <p className="text-sm text-gray-500">대표: {contract.companies?.representative}</p>
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-gray-50 rounded-xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm print:bg-white print:border">
            <div><span className="text-gray-500">계약 금액</span><p className="font-bold text-lg text-gray-900 mt-1">{contract.total_amount?.toLocaleString()}원</p></div>
            <div><span className="text-gray-500">착공일</span><p className="font-medium mt-1">{contract.start_date ? new Date(contract.start_date).toLocaleDateString("ko-KR") : "미정"}</p></div>
            <div><span className="text-gray-500">완공일</span><p className="font-medium mt-1">{contract.end_date ? new Date(contract.end_date).toLocaleDateString("ko-KR") : "미정"}</p></div>
            <div><span className="text-gray-500">계약일</span><p className="font-medium mt-1">{new Date(contract.created_at).toLocaleDateString("ko-KR")}</p></div>
          </div>

          {/* Payment Schedule */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">대금 지급 조건</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-y bg-gray-50"><th className="text-left p-3">구분</th><th className="text-right p-3">금액</th><th className="text-right p-3">상태</th></tr></thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={i} className="border-b"><td className="p-3">{p.label}</td><td className="p-3 text-right font-medium">{p.amount?.toLocaleString()}원</td><td className="p-3 text-right"><span className={`text-xs px-2 py-1 rounded-full ${p.status === "PAID" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.status === "PAID" ? "지급완료" : "대기"}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Terms */}
          {contract.warranty_terms && (
            <div><h3 className="font-semibold text-gray-900 mb-2">하자보수</h3><p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{contract.warranty_terms}</p></div>
          )}
          {contract.special_terms && (
            <div><h3 className="font-semibold text-gray-900 mb-2">특약사항</h3><p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{contract.special_terms}</p></div>
          )}

          {/* Signatures */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">서명</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-500 mb-2">발주자 (갑) 서명</p>
                {contract.customer_signature ? (
                  <img src={contract.customer_signature} alt="고객 서명" className="border rounded-lg max-h-24" />
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400 text-sm">미서명</div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">수급자 (을) 서명</p>
                {contract.company_signature ? (
                  <img src={contract.company_signature} alt="회사 서명" className="border rounded-lg max-h-24" />
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400 text-sm">미서명</div>
                )}
              </div>
            </div>
          </div>

          {/* Sign action */}
          {!mySignature && (contract.status === "DRAFT" || contract.status === "REVIEW" || contract.status === "PENDING_SIGN") && (
            <div className="print:hidden border-t pt-6">
              {showSignPad ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">아래에 서명해 주세요</p>
                  <SignaturePad onSave={handleSign} />
                </div>
              ) : (
                <Button onClick={() => setShowSignPad(true)} className="bg-green-600 hover:bg-green-700 text-white rounded-xl w-full h-12">
                  <FileText className="w-4 h-4 mr-2" /> 전자 서명하기
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
