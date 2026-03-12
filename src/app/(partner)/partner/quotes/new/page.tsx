"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Calculator, Loader2, MapPin, Ruler, Wallet, FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES, GARDEN_STYLES } from "@/lib/constants";
import { createQuote } from "../actions";

interface QuoteItem {
  id: string;
  category: string;
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

interface QuoteRequestData {
  id: string;
  customer_id: string;
  project_type: string;
  style: string | null;
  location: string;
  area: number;
  budget: string | null;
  preferred_schedule: string | null;
  requirements: string;
  extras: string[];
  current_photos: string[];
  reference_images: string[];
  created_at: string;
  profiles: { name: string } | null;
}

const categories = ["설계비", "식재 공사", "하드스케이프", "수경시설", "관수시설", "조명시설", "기타"];

function NewQuoteContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [requestData, setRequestData] = useState<QuoteRequestData | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(!!requestId);

  const [items, setItems] = useState<QuoteItem[]>([
    { id: "1", category: "설계비", name: "", spec: "", quantity: 1, unit: "식", unitPrice: 0, amount: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("계약금 30% / 중도금 40% / 잔금 30%");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load quote request data if requestId is provided
  useEffect(() => {
    if (!requestId) return;

    async function fetchRequest() {
      const supabase = createClient();
      const { data } = await supabase
        .from("quote_requests")
        .select("*, profiles!quote_requests_customer_id_fkey(name)")
        .eq("id", requestId!)
        .single();

      if (data) {
        setRequestData(data as unknown as QuoteRequestData);
      }
      setLoadingRequest(false);
    }
    fetchRequest();
  }, [requestId]);

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      category: "식재 공사",
      name: "",
      spec: "",
      quantity: 1,
      unit: "개",
      unitPrice: 0,
      amount: 0,
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
      }
      return updated;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, isDraft = false) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("items", JSON.stringify(items));
    formData.set("subtotal", subtotal.toString());
    formData.set("tax", tax.toString());
    formData.set("total", total.toString());
    formData.set("notes", notes);
    formData.set("paymentTerms", paymentTerms);
    formData.set("isDraft", isDraft ? "true" : "false");

    const result = await createQuote(formData);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  if (loadingRequest) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/partner/quotes">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">견적서 작성</h1>
          <p className="text-gray-500 mt-0.5">고객에게 보낼 견적서를 작성합니다</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Quote Request Info Card */}
      {requestData && (
        <Card className="p-6 bg-blue-50/50 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">고객 견적 요청 정보</h2>
            <Badge className="bg-blue-100 text-blue-700 text-xs">자동 연결</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> 위치</span>
              <p className="font-medium mt-0.5">{requestData.location}</p>
            </div>
            <div>
              <span className="text-gray-500 flex items-center gap-1"><Ruler className="w-3 h-3" /> 면적</span>
              <p className="font-medium mt-0.5">{requestData.area}㎡</p>
            </div>
            <div>
              <span className="text-gray-500">프로젝트</span>
              <p className="font-medium mt-0.5">
                {PROJECT_TYPES[requestData.project_type] || requestData.project_type}
                {requestData.style && ` · ${GARDEN_STYLES[requestData.style] || requestData.style}`}
              </p>
            </div>
            <div>
              <span className="text-gray-500 flex items-center gap-1"><Wallet className="w-3 h-3" /> 예산</span>
              <p className="font-medium mt-0.5">{requestData.budget || "미정"}</p>
            </div>
          </div>
          {requestData.preferred_schedule && (
            <p className="text-sm text-gray-600 mt-3">희망 일정: {requestData.preferred_schedule}</p>
          )}
          {requestData.requirements && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-gray-500 mb-1">고객 요구사항:</p>
              <p className="text-sm text-gray-700">{requestData.requirements}</p>
            </div>
          )}
          {requestData.extras && requestData.extras.length > 0 && (
            <div className="mt-2 flex gap-1.5 flex-wrap">
              {requestData.extras.map((extra, i) => (
                <Badge key={i} className="bg-blue-100 text-blue-700 text-xs">{extra}</Badge>
              ))}
            </div>
          )}
          {requestData.current_photos && requestData.current_photos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-gray-500 mb-2">현장 사진 ({requestData.current_photos.length}장)</p>
              <div className="flex gap-2 overflow-x-auto">
                {requestData.current_photos.map((url, i) => (
                  <img key={i} src={url} alt={`현장 사진 ${i + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}
          {requestData.reference_images && requestData.reference_images.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-gray-500 mb-2">레퍼런스 이미지 ({requestData.reference_images.length}장)</p>
              <div className="flex gap-2 overflow-x-auto">
                {requestData.reference_images.map((url, i) => (
                  <img key={i} src={url} alt={`레퍼런스 ${i + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        {/* Customer Info */}
        <Card className="p-6 space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">고객 정보</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>고객명</Label>
              <Input
                name="customerId"
                placeholder="고객명"
                className="mt-1.5 h-11 rounded-xl"
                defaultValue={requestData?.customer_id || ""}
                readOnly={!!requestData}
              />
              {requestData?.profiles?.name && (
                <p className="text-xs text-gray-500 mt-1">{requestData.profiles.name}</p>
              )}
            </div>
            <div>
              <Label>유효기간</Label>
              <Input name="validUntil" type="date" className="mt-1.5 h-11 rounded-xl" />
            </div>
          </div>
          <input type="hidden" name="quoteRequestId" value={requestData?.id || ""} />
        </Card>

        {/* Quote Items */}
        <Card className="p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">공사 항목</h2>
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> 항목 추가
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">항목 {idx + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={() => removeItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">분류</Label>
                    <select
                      className="mt-1 w-full h-9 rounded-lg border border-gray-200 px-2 text-sm"
                      value={item.category}
                      onChange={(e) => updateItem(item.id, "category", e.target.value)}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">품명</Label>
                    <Input
                      className="mt-1 h-9 rounded-lg text-sm"
                      placeholder="품명"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">규격</Label>
                    <Input
                      className="mt-1 h-9 rounded-lg text-sm"
                      placeholder="규격"
                      value={item.spec}
                      onChange={(e) => updateItem(item.id, "spec", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">단위</Label>
                    <Input
                      className="mt-1 h-9 rounded-lg text-sm"
                      placeholder="개"
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">수량</Label>
                    <Input
                      type="number"
                      className="mt-1 h-9 rounded-lg text-sm"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">단가 (원)</Label>
                    <Input
                      type="number"
                      className="mt-1 h-9 rounded-lg text-sm"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">금액</Label>
                    <div className="mt-1 h-9 rounded-lg bg-white border border-gray-200 px-3 flex items-center text-sm font-medium text-gray-900">
                      {item.amount.toLocaleString()}원
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-gray-900 rounded-xl p-5 text-white space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">소계</span>
              <span>{subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">부가세 (10%)</span>
              <span>{tax.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
              <span>합계</span>
              <span className="text-green-400">{total.toLocaleString()}원</span>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6 space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">추가 정보</h2>
          <div>
            <Label>결제 조건</Label>
            <Input
              className="mt-1.5 h-11 rounded-xl"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>
          <div>
            <Label>특이사항</Label>
            <Textarea
              className="mt-1.5 rounded-xl"
              placeholder="기타 안내사항이나 특이사항을 입력하세요"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl px-6"
            disabled={submitting}
            onClick={(e) => {
              const form = (e.target as HTMLElement).closest("form");
              if (!form) return;
              const formData = new FormData(form);
              formData.set("items", JSON.stringify(items));
              formData.set("subtotal", subtotal.toString());
              formData.set("tax", tax.toString());
              formData.set("total", total.toString());
              formData.set("notes", notes);
              formData.set("paymentTerms", paymentTerms);
              formData.set("isDraft", "true");
              setSubmitting(true);
              createQuote(formData).then(result => {
                if (result?.error) {
                  setError(result.error);
                  setSubmitting(false);
                }
              });
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            임시 저장
          </Button>
          <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
            견적서 발송
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    }>
      <NewQuoteContent />
    </Suspense>
  );
}
