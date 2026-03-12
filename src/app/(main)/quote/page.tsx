"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin, Ruler, Calendar, DollarSign, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { PROJECT_TYPES, GARDEN_STYLES, BUDGET_RANGES, EXTRAS_OPTIONS } from "@/lib/constants";
import type { ProjectType, GardenStyle } from "@/types";
import { submitQuoteRequest } from "./actions";

const steps = ["조경 유형", "상세 정보", "추가 요청", "확인"];

export default function QuotePage() {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    projectType: "" as string,
    style: "" as string,
    location: "",
    area: "",
    budget: "",
    schedule: "",
    requirements: "",
    extras: [] as string[],
    currentPhotos: [] as string[],
    referenceImages: [] as string[],
  });

  const updateForm = (key: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleExtra = (extra: string) => {
    setForm((prev) => ({
      ...prev,
      extras: prev.extras.includes(extra)
        ? prev.extras.filter((e) => e !== extra)
        : [...prev.extras, extra],
    }));
  };

  const canNext = () => {
    if (step === 0) return form.projectType !== "";
    if (step === 1) return form.location !== "" && form.area !== "";
    return true;
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">무료 견적 받기</h1>
          <p className="text-gray-500 mt-2">간단한 정보를 입력하면 맞춤 견적을 받아볼 수 있어요</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i < step ? "bg-green-600 text-white" :
                  i === step ? "bg-green-600 text-white ring-4 ring-green-100" :
                  "bg-gray-200 text-gray-500"
                }`}>
                  {i < step ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 ${i <= step ? "text-green-600 font-medium" : "text-gray-400"}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 ${i < step ? "bg-green-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Step 1: Project Type */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">어떤 조경을 원하시나요?</h2>
                <p className="text-sm text-gray-500">조경 유형을 선택해주세요</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(PROJECT_TYPES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => updateForm("projectType", key)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      form.projectType === key
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-1">선호하는 스타일이 있나요?</h3>
                <p className="text-sm text-gray-500 mb-3">선택사항입니다</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(GARDEN_STYLES).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => updateForm("style", key)}
                      className={`p-3 rounded-xl border-2 text-center transition-all text-sm ${
                        form.style === key
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">상세 정보를 입력해주세요</h2>
                <p className="text-sm text-gray-500">조경할 장소에 대한 정보가 필요해요</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" /> 위치 *
                  </Label>
                  <Input
                    placeholder="예: 경기도 성남시 판교"
                    value={form.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Ruler className="w-4 h-4 text-green-600" /> 면적 (㎡ 또는 평) *
                  </Label>
                  <Input
                    placeholder="예: 100㎡ 또는 30평"
                    value={form.area}
                    onChange={(e) => updateForm("area", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" /> 예산 범위
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {BUDGET_RANGES.map((range) => (
                      <button
                        key={range}
                        onClick={() => updateForm("budget", range)}
                        className={`p-3 rounded-xl border text-sm text-left transition-all ${
                          form.budget === range
                            ? "border-green-600 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Calendar className="w-4 h-4 text-green-600" /> 희망 시공 시기
                  </Label>
                  <Input
                    placeholder="예: 2024년 4월"
                    value={form.schedule}
                    onChange={(e) => updateForm("schedule", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Extras */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">추가 요청사항</h2>
                <p className="text-sm text-gray-500">원하는 항목을 선택해주세요 (선택사항)</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXTRAS_OPTIONS.map((extra) => (
                  <label
                    key={extra}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.extras.includes(extra)
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Checkbox
                      checked={form.extras.includes(extra)}
                      onCheckedChange={() => toggleExtra(extra)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <span className="text-sm text-gray-700">{extra}</span>
                  </label>
                ))}
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">기타 요청사항</Label>
                <Textarea
                  placeholder="추가로 전달하고 싶은 내용을 자유롭게 작성해주세요"
                  value={form.requirements}
                  onChange={(e) => updateForm("requirements", e.target.value)}
                  className="rounded-xl min-h-[120px]"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">현장 사진</Label>
                  <MultiImageUpload
                    bucket="portfolios"
                    folder="quote-photos"
                    maxImages={5}
                    value={form.currentPhotos}
                    onChange={(urls) => updateForm("currentPhotos", urls)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">레퍼런스 이미지</Label>
                  <MultiImageUpload
                    bucket="portfolios"
                    folder="quote-references"
                    maxImages={5}
                    value={form.referenceImages}
                    onChange={(urls) => updateForm("referenceImages", urls)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">견적 요청 내용을 확인해주세요</h2>
                <p className="text-sm text-gray-500">아래 내용으로 조경회사에 견적을 요청합니다</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">조경 유형</span>
                  <span className="font-medium text-gray-900">{PROJECT_TYPES[form.projectType as ProjectType] || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">선호 스타일</span>
                  <span className="font-medium text-gray-900">{GARDEN_STYLES[form.style as GardenStyle] || "미정"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">위치</span>
                  <span className="font-medium text-gray-900">{form.location || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">면적</span>
                  <span className="font-medium text-gray-900">{form.area || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">예산 범위</span>
                  <span className="font-medium text-gray-900">{form.budget || "미정"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">희망 시공 시기</span>
                  <span className="font-medium text-gray-900">{form.schedule || "미정"}</span>
                </div>
                {form.extras.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">추가 요청</span>
                    <span className="font-medium text-gray-900 text-right">{form.extras.join(", ")}</span>
                  </div>
                )}
                {(form.currentPhotos.length > 0 || form.referenceImages.length > 0) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">첨부 이미지</span>
                    <span className="font-medium text-gray-900">
                      현장 사진 {form.currentPhotos.length}장, 레퍼런스 {form.referenceImages.length}장
                    </span>
                  </div>
                )}
                {form.requirements && (
                  <div className="pt-3 border-t">
                    <span className="text-gray-500 block mb-1">기타 요청사항</span>
                    <span className="text-gray-900">{form.requirements}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mt-4">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> 이전
            </Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
              >
                다음 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8"
                onClick={() => {
                  setError(null);
                  const fd = new FormData();
                  fd.set("projectType", form.projectType);
                  fd.set("style", form.style);
                  fd.set("location", form.location);
                  fd.set("area", form.area);
                  fd.set("budget", form.budget);
                  fd.set("preferredSchedule", form.schedule);
                  fd.set("requirements", form.requirements);
                  fd.set("extras", JSON.stringify(form.extras));
                  fd.set("currentPhotos", JSON.stringify(form.currentPhotos));
                  fd.set("referenceImages", JSON.stringify(form.referenceImages));
                  startTransition(async () => {
                    const result = await submitQuoteRequest(fd);
                    if (result?.error) {
                      setError(result.error);
                    }
                  });
                }}
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                견적 요청하기
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
