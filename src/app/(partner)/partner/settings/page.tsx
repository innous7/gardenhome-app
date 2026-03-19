"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { updateCompanyProfile, cancelEditRequest } from "../actions";
import { createClient } from "@/lib/supabase/client";

interface CompanyData {
  id: string;
  company_name: string;
  representative: string;
  phone: string;
  business_number: string;
  address: string;
  description: string;
  service_areas: string[];
  specialties: string[];
  established: string | number | null;
}

interface EditRequest {
  id: string;
  requested_changes: Record<string, unknown>;
  status: string;
  admin_note: string | null;
  created_at: string;
}

export default function PartnerSettingsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [editRequest, setEditRequest] = useState<EditRequest | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("companies")
      .select("id, company_name, representative, phone, business_number, address, description, service_areas, specialties, established")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setCompany({
        ...data,
        service_areas: (data.service_areas as string[]) || [],
        specialties: (data.specialties as string[]) || [],
      });

      // 최근 수정 요청 확인 (pending 또는 최근 rejected)
      const { data: request } = await supabase
        .from("company_edit_requests")
        .select("id, requested_changes, status, admin_note, created_at")
        .eq("company_id", data.id)
        .in("status", ["pending", "rejected"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setEditRequest(request);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const serviceAreasRaw = formData.get("serviceAreas") as string || "";
    const specialtiesRaw = formData.get("specialties") as string || "";
    formData.set("serviceAreas", JSON.stringify(serviceAreasRaw.split(",").map(s => s.trim()).filter(Boolean)));
    formData.set("specialties", JSON.stringify(specialtiesRaw.split(",").map(s => s.trim()).filter(Boolean)));

    const result = await updateCompanyProfile(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: "수정 요청이 제출되었습니다. 관리자 승인 후 반영됩니다." });
      await fetchData();
    }
    setSubmitting(false);
  }

  async function handleCancel() {
    if (!editRequest) return;
    setCancelling(true);
    const result = await cancelEditRequest(editRequest.id);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "수정 요청이 취소되었습니다." });
      setEditRequest(null);
    }
    setCancelling(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  const isPending = editRequest?.status === "pending";
  const isRejected = editRequest?.status === "rejected";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-500 mt-1">회사 정보를 관리하세요</p>
      </div>

      {message && (
        <div className={`text-sm rounded-xl px-4 py-3 ${message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
          {message.text}
        </div>
      )}

      {/* 대기 중 배너 */}
      {isPending && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">수정 요청 검토 대기 중</p>
            <p className="text-sm text-amber-700 mt-0.5">
              {new Date(editRequest!.created_at).toLocaleDateString("ko-KR")}에 제출한 수정 요청이 관리자 검토를 기다리고 있습니다.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-xs shrink-0"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : "요청 취소"}
          </Button>
        </div>
      )}

      {/* 거절 배너 */}
      {isRejected && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">수정 요청이 거절되었습니다</p>
            {editRequest!.admin_note && (
              <p className="text-sm text-red-700 mt-0.5">사유: {editRequest!.admin_note}</p>
            )}
            <p className="text-xs text-red-600 mt-1">내용을 수정한 후 다시 제출해주세요.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">회사 프로필</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-green-600">
              {company?.company_name?.charAt(0) || "?"}
            </div>
            <Button type="button" variant="outline" className="rounded-xl"><Upload className="w-4 h-4 mr-2" /> 로고 변경</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>회사명</Label>
              <Input name="companyName" defaultValue={company?.company_name || ""} className="mt-1.5 h-11 rounded-xl" disabled={isPending} />
            </div>
            <div>
              <Label>대표자</Label>
              <Input defaultValue={company?.representative || ""} className="mt-1.5 h-11 rounded-xl" readOnly />
            </div>
            <div>
              <Label>연락처</Label>
              <Input name="phone" defaultValue={company?.phone || ""} className="mt-1.5 h-11 rounded-xl" disabled={isPending} />
            </div>
            <div>
              <Label>사업자등록번호</Label>
              <Input defaultValue={company?.business_number || ""} className="mt-1.5 h-11 rounded-xl" readOnly />
            </div>
          </div>
          <div>
            <Label>주소</Label>
            <Input name="address" defaultValue={company?.address || ""} className="mt-1.5 h-11 rounded-xl" disabled={isPending} />
          </div>
          <div>
            <Label>회사 소개</Label>
            <Textarea
              name="description"
              defaultValue={company?.description || ""}
              className="mt-1.5 rounded-xl min-h-[100px]"
              placeholder="회사 소개를 입력하세요"
              disabled={isPending}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">서비스 정보</h2>
          <div>
            <Label>서비스 지역</Label>
            <Input name="serviceAreas" defaultValue={company?.service_areas?.join(", ") || ""} className="mt-1.5 h-11 rounded-xl" placeholder="쉼표로 구분 (예: 서울, 경기)" disabled={isPending} />
          </div>
          <div>
            <Label>전문 분야</Label>
            <Input name="specialties" defaultValue={company?.specialties?.join(", ") || ""} className="mt-1.5 h-11 rounded-xl" placeholder="쉼표로 구분 (예: 정원 설계, 모던 조경)" disabled={isPending} />
          </div>
          <div>
            <Label>설립연도</Label>
            <Input defaultValue={company?.established?.toString() || ""} className="mt-1.5 h-11 rounded-xl" placeholder="2020" readOnly />
          </div>
        </Card>

        <div className="flex justify-end">
          {isPending ? (
            <p className="text-sm text-gray-500">수정 요청 검토 중에는 새로운 수정이 불가합니다.</p>
          ) : (
            <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              수정 요청하기
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
