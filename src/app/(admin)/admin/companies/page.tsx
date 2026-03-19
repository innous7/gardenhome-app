"use client";

import { useState, useEffect, useTransition } from "react";
import { CheckCircle, Clock, Search, Pencil, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";
import { approveCompany, rejectCompany, updateCompany, deleteCompany } from "../actions";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Tables<"companies">[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editingCompany, setEditingCompany] = useState<Tables<"companies"> | null>(null);
  const [editForm, setEditForm] = useState({
    company_name: "",
    representative: "",
    address: "",
    phone: "",
    business_number: "",
    established: "",
    description: "",
  });

  const fetchCompanies = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCompanies(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleApprove = (companyId: string) => {
    setError("");
    startTransition(async () => {
      const result = await approveCompany(companyId);
      if (result?.error) {
        setError("승인 실패: " + result.error);
      } else {
        await fetchCompanies();
      }
    });
  };

  const handleReject = (companyId: string) => {
    const reason = prompt("거절 사유를 입력해주세요 (선택사항):");
    if (reason === null) return;

    setError("");
    startTransition(async () => {
      const result = await rejectCompany(companyId, reason || undefined);
      if (result?.error) {
        setError("거절 실패: " + result.error);
      } else {
        await fetchCompanies();
      }
    });
  };

  const handleEdit = (company: Tables<"companies">) => {
    setEditingCompany(company);
    setEditForm({
      company_name: company.company_name,
      representative: company.representative || "",
      address: company.address || "",
      phone: company.phone || "",
      business_number: company.business_number || "",
      established: company.established?.toString() || "",
      description: company.description || "",
    });
  };

  const handleEditSave = () => {
    if (!editingCompany) return;
    setError("");

    startTransition(async () => {
      const result = await updateCompany(editingCompany.id, {
        company_name: editForm.company_name,
        representative: editForm.representative,
        address: editForm.address,
        phone: editForm.phone,
        business_number: editForm.business_number,
        established: editForm.established || null,
        description: editForm.description,
      });
      if (result?.error) {
        setError("수정 실패: " + result.error);
      } else {
        setEditingCompany(null);
        await fetchCompanies();
      }
    });
  };

  const handleDelete = (companyId: string, companyName: string) => {
    if (!confirm(`"${companyName}" 회사를 정말 삭제하시겠습니까?\n\n관련된 포트폴리오, 견적 등 모든 데이터가 삭제됩니다.`)) return;

    setError("");
    startTransition(async () => {
      const result = await deleteCompany(companyId);
      if (result?.error) {
        setError("삭제 실패: " + result.error);
      } else {
        await fetchCompanies();
      }
    });
  };

  const filtered = companies.filter(c =>
    c.company_name.includes(search)
  );

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
        <h1 className="text-2xl font-bold text-gray-900">조경회사 관리</h1>
        <p className="text-gray-500 mt-1">등록된 조경회사를 관리하고 승인하세요</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="회사명으로 검색"
          className="pl-10 h-11 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="text-sm text-gray-500">
        총 <span className="font-semibold text-gray-900">{filtered.length}</span>개 회사
      </div>

      {/* Edit Modal */}
      {editingCompany && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingCompany(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">회사 정보 수정</h2>
              <button onClick={() => setEditingCompany(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">회사명</label>
                <Input value={editForm.company_name} onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">대표자</label>
                  <Input value={editForm.representative} onChange={(e) => setEditForm({ ...editForm, representative: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">전화번호</label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">주소</label>
                <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">사업자번호</label>
                  <Input value={editForm.business_number} onChange={(e) => setEditForm({ ...editForm, business_number: e.target.value })} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">설립연도</label>
                  <Input type="number" value={editForm.established} onChange={(e) => setEditForm({ ...editForm, established: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">설명</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setEditingCompany(null)}>취소</Button>
              <Button className="rounded-xl bg-green-600 hover:bg-green-700 text-white" onClick={handleEditSave} disabled={isPending}>
                {isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">등록된 조경회사가 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">회사가 등록되면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((company) => (
            <Card key={company.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-lg font-bold text-green-600">
                    {company.company_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{company.company_name}</h3>
                      {company.is_approved ? (
                        <Badge className="bg-green-50 text-green-700 text-xs"><CheckCircle className="w-3 h-3 mr-1" /> 승인</Badge>
                      ) : (
                        <Badge className="bg-yellow-50 text-yellow-700 text-xs"><Clock className="w-3 h-3 mr-1" /> 대기</Badge>
                      )}
                      {company.is_verified && (
                        <Badge className="bg-blue-50 text-blue-700 text-xs">인증</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">대표: {company.representative} · {company.address} · {company.phone}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      사업자번호: {company.business_number} · 설립: {company.established}년
                      {company.business_license_url && (
                        <> · <button
                          type="button"
                          className="text-blue-500 hover:underline"
                          onClick={async () => {
                            const supabase = createClient();
                            const { data } = await supabase.storage
                              .from("business-licenses")
                              .createSignedUrl(company.business_license_url!, 600);
                            if (data?.signedUrl) {
                              window.open(data.signedUrl, "_blank");
                            }
                          }}
                        >사업자등록증 보기</button></>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs"
                    onClick={() => handleEdit(company)}
                  >
                    <Pencil className="w-3 h-3 mr-1" /> 수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(company.id, company.company_name)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> 삭제
                  </Button>
                  {!company.is_approved && (
                    <>
                      <Button
                        size="sm"
                        className="rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white"
                        disabled={isPending}
                        onClick={() => handleApprove(company.id)}
                      >
                        {isPending ? "처리 중..." : "승인"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs text-red-600 hover:bg-red-50"
                        disabled={isPending}
                        onClick={() => handleReject(company.id)}
                      >
                        거절
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
