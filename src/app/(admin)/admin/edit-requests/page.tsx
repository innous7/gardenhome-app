"use client";

import { useState, useEffect, useTransition } from "react";
import { Clock, CheckCircle, XCircle, ArrowRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { approveEditRequest, rejectEditRequest } from "../actions";

interface EditRequest {
  id: string;
  company_id: string;
  requested_changes: Record<string, unknown>;
  status: string;
  admin_note: string | null;
  created_at: string;
  companies: {
    company_name: string;
    phone: string;
    address: string;
    description: string;
    specialties: string[];
    service_areas: string[];
  };
}

const FIELD_LABELS: Record<string, string> = {
  company_name: "회사명",
  phone: "연락처",
  address: "주소",
  description: "회사 소개",
  specialties: "전문 분야",
  service_areas: "서비스 지역",
};

function formatValue(val: unknown): string {
  if (Array.isArray(val)) return val.join(", ");
  return String(val || "-");
}

export default function AdminEditRequestsPage() {
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState<EditRequest | null>(null);
  const [editedChanges, setEditedChanges] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const fetchRequests = async () => {
    const supabase = createClient();
    const query = supabase
      .from("company_edit_requests")
      .select("id, company_id, requested_changes, status, admin_note, created_at, companies(company_name, phone, address, description, specialties, service_areas)")
      .order("created_at", { ascending: false });

    if (filter === "pending") {
      query.eq("status", "pending");
    }

    const { data } = await query;
    setRequests((data as unknown as EditRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, [filter]);

  const handleApprove = (requestId: string) => {
    setError("");
    startTransition(async () => {
      const result = await approveEditRequest(requestId);
      if (result?.error) {
        setError("승인 실패: " + result.error);
      } else {
        await fetchRequests();
      }
    });
  };

  const handleReject = (requestId: string) => {
    const reason = prompt("거절 사유를 입력해주세요:");
    if (reason === null) return;

    setError("");
    startTransition(async () => {
      const result = await rejectEditRequest(requestId, reason || undefined);
      if (result?.error) {
        setError("거절 실패: " + result.error);
      } else {
        await fetchRequests();
      }
    });
  };

  const openEditModal = (req: EditRequest) => {
    setEditModal(req);
    const changes: Record<string, string> = {};
    for (const [key, val] of Object.entries(req.requested_changes)) {
      changes[key] = Array.isArray(val) ? val.join(", ") : String(val || "");
    }
    setEditedChanges(changes);
  };

  const handleEditApprove = () => {
    if (!editModal) return;
    setError("");

    // 수정된 값으로 승인
    const finalChanges: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(editedChanges)) {
      if (key === "specialties" || key === "service_areas") {
        finalChanges[key] = val.split(",").map(s => s.trim()).filter(Boolean);
      } else {
        finalChanges[key] = val;
      }
    }

    startTransition(async () => {
      const result = await approveEditRequest(editModal.id, finalChanges);
      if (result?.error) {
        setError("승인 실패: " + result.error);
      } else {
        setEditModal(null);
        await fetchRequests();
      }
    });
  };

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
        <h1 className="text-2xl font-bold text-gray-900">정보수정 요청</h1>
        <p className="text-gray-500 mt-1">파트너 회사 정보 수정 요청을 검토하세요</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          className={`rounded-lg text-xs ${filter === "pending" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
          onClick={() => setFilter("pending")}
        >
          대기 중
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          className={`rounded-lg text-xs ${filter === "all" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
          onClick={() => setFilter("all")}
        >
          전체
        </Button>
      </div>

      <div className="text-sm text-gray-500">
        총 <span className="font-semibold text-gray-900">{requests.length}</span>건
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">수정 후 승인</h2>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">필요한 부분을 수정한 후 승인하세요.</p>
            <div className="space-y-3">
              {Object.entries(editedChanges).map(([key, val]) => (
                <div key={key}>
                  <label className="text-sm text-gray-600 mb-1 block">{FIELD_LABELS[key] || key}</label>
                  {key === "description" ? (
                    <Textarea
                      value={val}
                      onChange={(e) => setEditedChanges({ ...editedChanges, [key]: e.target.value })}
                      className="rounded-xl text-sm"
                    />
                  ) : (
                    <Input
                      value={val}
                      onChange={(e) => setEditedChanges({ ...editedChanges, [key]: e.target.value })}
                      className="rounded-xl"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setEditModal(null)}>취소</Button>
              <Button className="rounded-xl bg-green-600 hover:bg-green-700 text-white" onClick={handleEditApprove} disabled={isPending}>
                {isPending ? "처리 중..." : "수정 후 승인"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">{filter === "pending" ? "대기 중인 수정 요청이 없습니다" : "수정 요청 내역이 없습니다"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const company = req.companies;
            const changes = req.requested_changes as Record<string, unknown>;

            return (
              <Card key={req.id} className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-sm font-bold text-green-600">
                      {company?.company_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{company?.company_name}</h3>
                      <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString("ko-KR")} 요청</p>
                    </div>
                  </div>
                  {req.status === "pending" && (
                    <Badge className="bg-yellow-50 text-yellow-700 text-xs"><Clock className="w-3 h-3 mr-1" /> 대기</Badge>
                  )}
                  {req.status === "approved" && (
                    <Badge className="bg-green-50 text-green-700 text-xs"><CheckCircle className="w-3 h-3 mr-1" /> 승인</Badge>
                  )}
                  {req.status === "rejected" && (
                    <Badge className="bg-red-50 text-red-700 text-xs"><XCircle className="w-3 h-3 mr-1" /> 거절</Badge>
                  )}
                </div>

                {/* Changes comparison */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 mb-2">변경 내용</p>
                  {Object.entries(changes).map(([key, newVal]) => {
                    const currentVal = company?.[key as keyof typeof company];
                    const changed = formatValue(currentVal) !== formatValue(newVal);
                    return (
                      <div key={key} className={`flex items-start gap-2 text-sm ${changed ? "" : "opacity-50"}`}>
                        <span className="text-gray-500 w-20 shrink-0">{FIELD_LABELS[key] || key}</span>
                        <span className="text-gray-400 line-through">{formatValue(currentVal)}</span>
                        {changed && <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                        {changed && <span className="text-green-700 font-medium">{formatValue(newVal)}</span>}
                      </div>
                    );
                  })}
                </div>

                {req.admin_note && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">거절 사유: {req.admin_note}</p>
                )}

                {/* Actions */}
                {req.status === "pending" && (
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      className="rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white"
                      disabled={isPending}
                      onClick={() => handleApprove(req.id)}
                    >
                      승인
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs"
                      disabled={isPending}
                      onClick={() => openEditModal(req)}
                    >
                      수정 후 승인
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs text-red-600 hover:bg-red-50"
                      disabled={isPending}
                      onClick={() => handleReject(req.id)}
                    >
                      거절
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
