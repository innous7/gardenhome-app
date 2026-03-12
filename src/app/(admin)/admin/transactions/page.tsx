"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES } from "@/lib/constants";

type ContractRow = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  companies: { company_name: string } | null;
  profiles: { name: string } | null;
  quotes: { quote_requests: { project_type: string } | null } | null;
};

const statusMap: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "초안", className: "bg-gray-100 text-gray-700" },
  REVIEW: { label: "검토 중", className: "bg-yellow-50 text-yellow-700" },
  PENDING_SIGN: { label: "서명 대기", className: "bg-blue-50 text-blue-700" },
  SIGNED: { label: "계약 체결", className: "bg-green-50 text-green-700" },
  COMPLETED: { label: "완료", className: "bg-purple-50 text-purple-700" },
  CANCELLED: { label: "취소", className: "bg-red-50 text-red-700" },
};

export default function AdminTransactionsPage() {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("contracts")
        .select("*, companies(company_name), profiles!contracts_customer_id_fkey(name), quotes(quote_requests(project_type))")
        .order("created_at", { ascending: false });
      setContracts((data as ContractRow[] | null) ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = contracts.filter((c) => {
    if (!search) return true;
    const name = c.profiles?.name || "";
    const company = c.companies?.company_name || "";
    return name.includes(search) || company.includes(search);
  });

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
        <h1 className="text-2xl font-bold text-gray-900">거래 관리</h1>
        <p className="text-gray-500 mt-1">견적, 계약, 결제 내역을 관리하세요</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="고객 또는 회사명으로 검색"
          className="pl-10 h-11 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-500">거래 정보</th>
                <th className="text-left p-4 font-medium text-gray-500">조경회사</th>
                <th className="text-left p-4 font-medium text-gray-500">금액</th>
                <th className="text-left p-4 font-medium text-gray-500">상태</th>
                <th className="text-left p-4 font-medium text-gray-500">일자</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c) => {
                  const customerName = c.profiles?.name
                    ? c.profiles.name.charAt(0) + "**"
                    : "-";
                  const projectType =
                    PROJECT_TYPES[c.quotes?.quote_requests?.project_type || ""] || "기타";
                  const companyName = c.companies?.company_name || "-";
                  const status = statusMap[c.status] || statusMap.DRAFT;

                  return (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {customerName} · {projectType}
                        </p>
                      </td>
                      <td className="p-4 text-gray-600">{companyName}</td>
                      <td className="p-4 font-semibold text-gray-900">
                        {c.total_amount.toLocaleString()}원
                      </td>
                      <td className="p-4">
                        <Badge className={`text-xs ${status.className}`}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(c.created_at).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    거래 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
