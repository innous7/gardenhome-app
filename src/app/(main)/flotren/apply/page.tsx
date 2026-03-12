"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FLOTREN_PLANS } from "@/lib/constants";
import { applyFlotren } from "../actions";

const planFeatures: Record<string, string[]> = {
  BASIC: ["월 1회 방문", "잔디 관리", "잡초 제거", "기본 전정"],
  STANDARD: [
    "월 2회 방문",
    "잔디+전정",
    "시비+병충해",
    "봄/가을 특별관리",
    "분기 리포트",
  ],
  PREMIUM: [
    "주 1회 방문",
    "풀 케어",
    "수경시설 관리",
    "긴급 출동",
    "월별 리포트",
    "전문가 상담",
  ],
};

export default function FlotrenApplyPageWrapper() {
  return <Suspense fallback={<div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>}><FlotrenApplyPage /></Suspense>;
}

function FlotrenApplyPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    plan: searchParams.get("plan") || "STANDARD",
    gardenArea: "",
    address: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = () => {
    setError(null);
    const fd = new FormData();
    fd.set("plan", form.plan);
    fd.set("gardenArea", form.gardenArea);
    fd.set("address", form.address);
    fd.set("phone", form.phone);
    fd.set("notes", form.notes);
    startTransition(async () => {
      const result = await applyFlotren(fd);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Flotren 구독 신청
          </h1>
          <p className="text-gray-500 mt-2">
            정원 관리 구독 서비스를 신청하세요
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["플랜 선택", "정원 정보", "확인"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  i <= step
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs ml-1.5 mr-3 ${
                  i <= step
                    ? "text-green-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                {s}
              </span>
              {i < 2 && (
                <div
                  className={`w-8 h-0.5 ${
                    i < step ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                플랜을 선택하세요
              </h2>
              <div className="space-y-3">
                {Object.entries(FLOTREN_PLANS).map(([key, plan]) => (
                  <button
                    key={key}
                    onClick={() => setForm((prev) => ({ ...prev, plan: key }))}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      form.plan === key
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">
                        {plan.name}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {plan.price.toLocaleString()}원
                        <span className="text-sm font-normal text-gray-500">
                          /월
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{plan.visits}</p>
                    <div className="flex flex-wrap gap-2">
                      {planFeatures[key].map((f) => (
                        <span
                          key={f}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900">
                정원 정보를 입력해주세요
              </h2>
              <div>
                <Label>주소 *</Label>
                <Input
                  placeholder="정원이 있는 주소"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  className="mt-1.5 h-12 rounded-xl"
                />
              </div>
              <div>
                <Label>정원 면적 (㎡)</Label>
                <Input
                  type="number"
                  placeholder="예: 100"
                  value={form.gardenArea}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, gardenArea: e.target.value }))
                  }
                  className="mt-1.5 h-12 rounded-xl"
                />
              </div>
              <div>
                <Label>연락처 *</Label>
                <Input
                  placeholder="010-0000-0000"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="mt-1.5 h-12 rounded-xl"
                />
              </div>
              <div>
                <Label>추가 요청사항</Label>
                <Textarea
                  placeholder="특이사항이나 요청사항을 입력하세요"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="mt-1.5 rounded-xl min-h-[100px]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  구독 신청 내용 확인
                </h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">플랜</span>
                  <span className="font-medium">
                    {
                      FLOTREN_PLANS[
                        form.plan as keyof typeof FLOTREN_PLANS
                      ]?.name
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">월 요금</span>
                  <span className="font-bold text-green-600">
                    {FLOTREN_PLANS[
                      form.plan as keyof typeof FLOTREN_PLANS
                    ]?.price.toLocaleString()}
                    원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">방문 주기</span>
                  <span className="font-medium">
                    {
                      FLOTREN_PLANS[
                        form.plan as keyof typeof FLOTREN_PLANS
                      ]?.visits
                    }
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">주소</span>
                    <span className="font-medium">{form.address}</span>
                  </div>
                </div>
                {form.gardenArea && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">면적</span>
                    <span className="font-medium">{form.gardenArea}㎡</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">연락처</span>
                  <span className="font-medium">{form.phone}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                * 신청 후 담당자가 연락드려 일정을 조율합니다.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mt-4">
              {error}
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={() =>
                step === 0 ? window.history.back() : setStep((s) => s - 1)
              }
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />{" "}
              {step === 0 ? "돌아가기" : "이전"}
            </Button>
            {step < 2 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && (!form.address || !form.phone)}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
              >
                다음 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8"
              >
                {isPending && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                구독 신청하기
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
