"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES } from "@/lib/constants";

type ContractRow = {
  id: string;
  total_amount: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  signed_at: string | null;
  created_at: string;
  companies: { company_name: string } | null;
  quotes: { quote_requests: { project_type: string } | null } | null;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "초안", color: "bg-gray-100 text-gray-700" },
  REVIEW: { label: "검토 중", color: "bg-yellow-50 text-yellow-700" },
  PENDING_SIGN: { label: "서명 대기", color: "bg-blue-50 text-blue-700" },
  SIGNED: { label: "계약 완료", color: "bg-green-50 text-green-700" },
  COMPLETED: { label: "시공 완료", color: "bg-purple-50 text-purple-700" },
  CANCELLED: { label: "취소", color: "bg-red-50 text-red-700" },
};

export default function CustomerContractsPage() {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("contracts")
        .select("*, companies(company_name), quotes(quote_requests(project_type))")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      setContracts((data as ContractRow[] | null) ?? []);
      setLoading(false);
    };
    fetchContracts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">계약 내역</h1>
        <p className="text-gray-500 mt-1">계약 현황을 확인하고 계약서를 다운로드하세요</p>
      </div>

      {contracts.length > 0 ? (
        <div className="space-y-4">
          {contracts.map((c) => {
            const companyName = c.companies?.company_name || "-";
            const projectType =
              PROJECT_TYPES[c.quotes?.quote_requests?.project_type || ""] || "기타";
            const status = statusLabels[c.status] || statusLabels.DRAFT;
            const startDate = c.start_date
              ? new Date(c.start_date).toLocaleDateString("ko-KR")
              : "-";
            const endDate = c.end_date
              ? new Date(c.end_date).toLocaleDateString("ko-KR")
              : "-";

            return (
              <Card key={c.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{companyName}</h3>
                        <Badge className={`text-xs ${status.color}`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {projectType} · {startDate} ~ {endDate}
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {c.total_amount.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs">
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                    <Link href={`/contracts/${c.id}`}>
                      <Button variant="outline" size="sm" className="rounded-lg text-xs">
                        상세보기
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center text-gray-400">
          아직 계약 내역이 없습니다.
        </Card>
      )}
    </div>
  );
}
