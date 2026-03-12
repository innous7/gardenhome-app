"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { updateCompanyProfile } from "../actions";

export default function PartnerSettingsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Convert comma-separated strings to JSON arrays
    const serviceAreasRaw = formData.get("serviceAreas") as string || "";
    const specialtiesRaw = formData.get("specialties") as string || "";
    formData.set("serviceAreas", JSON.stringify(serviceAreasRaw.split(",").map(s => s.trim()).filter(Boolean)));
    formData.set("specialties", JSON.stringify(specialtiesRaw.split(",").map(s => s.trim()).filter(Boolean)));

    const result = await updateCompanyProfile(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: "저장되었습니다." });
    }
    setSubmitting(false);
  }

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

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">회사 프로필</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-green-600">G</div>
            <Button type="button" variant="outline" className="rounded-xl"><Upload className="w-4 h-4 mr-2" /> 로고 변경</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>회사명</Label>
              <Input name="companyName" defaultValue="그린가든 조경" className="mt-1.5 h-11 rounded-xl" />
            </div>
            <div>
              <Label>대표자</Label>
              <Input defaultValue="김정원" className="mt-1.5 h-11 rounded-xl" />
            </div>
            <div>
              <Label>연락처</Label>
              <Input name="phone" defaultValue="02-1234-5678" className="mt-1.5 h-11 rounded-xl" />
            </div>
            <div>
              <Label>사업자등록번호</Label>
              <Input defaultValue="123-45-67890" className="mt-1.5 h-11 rounded-xl" readOnly />
            </div>
          </div>
          <div>
            <Label>주소</Label>
            <Input name="address" defaultValue="서울특별시 강남구" className="mt-1.5 h-11 rounded-xl" />
          </div>
          <div>
            <Label>회사 소개</Label>
            <Textarea
              name="description"
              defaultValue="20년 경력의 정원 전문 조경회사입니다."
              className="mt-1.5 rounded-xl min-h-[100px]"
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">서비스 정보</h2>
          <div>
            <Label>서비스 지역</Label>
            <Input name="serviceAreas" defaultValue="서울, 경기" className="mt-1.5 h-11 rounded-xl" placeholder="쉼표로 구분" />
          </div>
          <div>
            <Label>전문 분야</Label>
            <Input name="specialties" defaultValue="정원 설계, 모던 조경, 수경시설" className="mt-1.5 h-11 rounded-xl" placeholder="쉼표로 구분" />
          </div>
          <div>
            <Label>설립연도</Label>
            <Input defaultValue="2004" className="mt-1.5 h-11 rounded-xl" />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            저장하기
          </Button>
        </div>
      </form>
    </div>
  );
}
