"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Upload, FileCheck, X, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { applyPartner } from "./actions";

export default function PartnerApplyForm() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: company } = await supabase
          .from("companies")
          .select("id, is_approved")
          .eq("user_id", user.id)
          .maybeSingle();
        if (company) {
          setAlreadyApplied(true);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("JPG, PNG, PDF 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from("business-licenses")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setError("파일 업로드에 실패했습니다. 다시 시도해주세요.");
      setUploading(false);
      return;
    }

    setLicenseFile(file);
    setLicenseUrl(data.path);
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!licenseUrl) {
      setError("사업자등록증을 첨부해주세요.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("businessLicenseUrl", licenseUrl);

    startTransition(async () => {
      const result = await applyPartner(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSubmitted(true);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">파트너 신청을 하려면 먼저 회원가입이 필요합니다.</p>
        <div className="flex gap-3 justify-center">
          <a href="/register">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12 text-base font-semibold">
              회원가입하기
            </Button>
          </a>
          <a href="/login">
            <Button variant="outline" className="rounded-full px-8 h-12 text-base">
              로그인
            </Button>
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">입점 신청이 완료되었습니다!</h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          관리자가 사업자등록증을 확인한 후 승인해드립니다.
          영업일 기준 1~2일 내에 처리되며, 승인 결과는 마이페이지에서 확인하실 수 있습니다.
        </p>
        <Link href="/mypage">
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 mt-2">
            마이페이지로 이동
          </Button>
        </Link>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">이미 입점 신청이 접수되었습니다</h3>
        <p className="text-gray-600">
          현재 관리자 승인 대기 중입니다. 마이페이지에서 진행 상태를 확인하세요.
        </p>
        <Link href="/mypage">
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 mt-2">
            마이페이지로 이동
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="companyName" className="text-sm font-medium">회사명</Label>
        <div className="relative mt-1.5">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="companyName"
            name="companyName"
            placeholder="회사명을 입력하세요"
            className="pl-10 h-12 rounded-xl"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="businessNumber" className="text-sm font-medium">사업자등록번호</Label>
        <Input
          id="businessNumber"
          name="businessNumber"
          placeholder="000-00-00000"
          className="h-12 rounded-xl"
          required
        />
      </div>

      <div>
        <Label className="text-sm font-medium">사업자등록증 첨부 <span className="text-red-500">*</span></Label>
        <div className="mt-1.5">
          {licenseFile ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <FileCheck className="w-5 h-5 text-green-600 shrink-0" />
              <span className="text-sm text-green-700 truncate flex-1">{licenseFile.name}</span>
              <button
                type="button"
                onClick={() => { setLicenseFile(null); setLicenseUrl(null); }}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 hover:border-green-400 rounded-xl bg-gray-50 hover:bg-green-50/50 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">사업자등록증 파일 선택</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, PDF (최대 10MB)</p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || !licenseUrl}
        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-base font-semibold disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "파트너 입점 신청하기"}
      </Button>
    </form>
  );
}
