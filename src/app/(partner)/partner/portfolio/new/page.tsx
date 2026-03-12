"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { PROJECT_TYPES, GARDEN_STYLES } from "@/lib/constants";
import { createPortfolio } from "../actions";

export default function NewPortfolioPage() {
  const [plants, setPlants] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [plantInput, setPlantInput] = useState("");
  const [materialInput, setMaterialInput] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  const [afterImages, setAfterImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addTag = (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
    if (input.trim() && !list.includes(input.trim())) {
      setList([...list, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (list: string[], setList: (v: string[]) => void, tag: string) => {
    setList(list.filter(t => t !== tag));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, isDraft = false) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("coverImageUrl", coverImageUrl);
    formData.set("plants", JSON.stringify(plants));
    formData.set("materials", JSON.stringify(materials));
    formData.set("beforeImages", JSON.stringify(beforeImages));
    formData.set("afterImages", JSON.stringify(afterImages));
    if (isDraft) formData.set("isDraft", "true");

    const result = await createPortfolio(formData);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/partner/portfolio">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">포트폴리오 등록</h1>
          <p className="text-gray-500 mt-0.5">시공 사례를 상세하게 작성해주세요</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
          <div>
            <Label>제목 *</Label>
            <Input name="title" placeholder="예: 판교 단독주택 모던 정원 프로젝트" className="mt-1.5 h-12 rounded-xl" required />
          </div>
          <div>
            <Label>요약</Label>
            <Textarea name="excerpt" placeholder="프로젝트를 한 줄로 요약해주세요" className="mt-1.5 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>조경 유형 *</Label>
              <select name="projectType" className="mt-1.5 w-full h-12 rounded-xl border border-gray-200 px-3 text-sm" required>
                <option value="">선택하세요</option>
                {Object.entries(PROJECT_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>스타일 *</Label>
              <select name="style" className="mt-1.5 w-full h-12 rounded-xl border border-gray-200 px-3 text-sm" required>
                <option value="">선택하세요</option>
                {Object.entries(GARDEN_STYLES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>위치</Label>
              <Input name="location" placeholder="예: 경기도 성남시 판교" className="mt-1.5 h-12 rounded-xl" />
            </div>
            <div>
              <Label>면적 (㎡)</Label>
              <Input name="area" type="number" placeholder="150" className="mt-1.5 h-12 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>시공 기간</Label>
              <Input name="duration" placeholder="예: 4주" className="mt-1.5 h-12 rounded-xl" />
            </div>
            <div>
              <Label>예산 범위</Label>
              <Input name="budget" placeholder="예: 3,000만원~5,000만원" className="mt-1.5 h-12 rounded-xl" />
            </div>
          </div>
        </Card>

        {/* Images */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">이미지</h2>
          <div>
            <Label>대표 이미지 *</Label>
            <div className="mt-1.5">
              <ImageUpload
                bucket="portfolios"
                folder="covers"
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                onRemove={() => setCoverImageUrl("")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Before 이미지</Label>
              <div className="mt-1.5">
                <MultiImageUpload
                  bucket="portfolios"
                  folder="before"
                  value={beforeImages}
                  onChange={setBeforeImages}
                  maxImages={5}
                />
              </div>
            </div>
            <div>
              <Label>After 이미지</Label>
              <div className="mt-1.5">
                <MultiImageUpload
                  bucket="portfolios"
                  folder="after"
                  value={afterImages}
                  onChange={setAfterImages}
                  maxImages={5}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Content */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">상세 설명</h2>
          <Textarea
            name="content"
            placeholder="시공 과정, 디자인 컨셉, 특이사항 등을 자유롭게 작성해주세요..."
            className="rounded-xl min-h-[200px]"
          />
        </Card>

        {/* Tags */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">식물 & 자재</h2>
          <div>
            <Label>사용 식물</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                placeholder="식물명 입력 후 추가"
                value={plantInput}
                onChange={(e) => setPlantInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(plants, setPlants, plantInput, setPlantInput); } }}
                className="h-10 rounded-xl"
              />
              <Button type="button" variant="outline" className="rounded-xl shrink-0" onClick={() => addTag(plants, setPlants, plantInput, setPlantInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {plants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {plants.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                    {p}
                    <button type="button" onClick={() => removeTag(plants, setPlants, p)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label>사용 자재</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                placeholder="자재명 입력 후 추가"
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(materials, setMaterials, materialInput, setMaterialInput); } }}
                className="h-10 rounded-xl"
              />
              <Button type="button" variant="outline" className="rounded-xl shrink-0" onClick={() => addTag(materials, setMaterials, materialInput, setMaterialInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {materials.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {materials.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    {m}
                    <button type="button" onClick={() => removeTag(materials, setMaterials, m)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl px-6"
            disabled={submitting}
            onClick={() => {
              const form = document.querySelector("form");
              if (form) {
                const event = new Event("submit", { bubbles: true, cancelable: true });
                Object.defineProperty(event, "currentTarget", { value: form });
                handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>, true);
              }
            }}
          >
            임시 저장
          </Button>
          <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            발행하기
          </Button>
        </div>
      </form>
    </div>
  );
}
