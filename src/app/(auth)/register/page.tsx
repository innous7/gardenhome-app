"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Phone, Building2, UserPlus, Loader2, Upload, FileCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { signUp } from "../actions";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"customer" | "company">("customer");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      .upload(fileName, file);

    if (uploadError) {
      setError("파일 업로드에 실패했습니다. 다시 시도해주세요.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("business-licenses")
      .getPublicUrl(data.path);

    setLicenseFile(file);
    setLicenseUrl(urlData.publicUrl);
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("role", userType === "company" ? "COMPANY" : "CUSTOMER");

    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (userType === "company" && !licenseUrl) {
      setError("사업자등록증을 첨부해주세요.");
      return;
    }

    if (licenseUrl) {
      formData.set("businessLicenseUrl", licenseUrl);
    }

    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-sm text-gray-500 mt-2">GardenHome과 함께 시작하세요</p>
        </div>

        {/* User Type Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setUserType("customer")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              userType === "customer"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            일반 회원
          </button>
          <button
            onClick={() => setUserType("company")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              userType === "company"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Building2 className="w-4 h-4" />
            조경회사
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">이름</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="name"
                name="name"
                placeholder="이름을 입력하세요"
                className="pl-10 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">이메일</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
                className="pl-10 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium">전화번호</Label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="010-0000-0000"
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>

          {userType === "company" && (
            <>
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
                <Label className="text-sm font-medium">사업자등록증 첨부 *</Label>
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
            </>
          )}

          <div>
            <Label htmlFor="password" className="text-sm font-medium">비밀번호</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="8자 이상 입력하세요"
                className="pl-10 pr-10 h-12 rounded-xl"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="passwordConfirm" className="text-sm font-medium">비밀번호 확인</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                className="pl-10 h-12 rounded-xl"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2">
            가입 시{" "}
            <Link href="/terms" className="text-green-600 underline">이용약관</Link>
            {" "}및{" "}
            <Link href="/privacy" className="text-green-600 underline">개인정보처리방침</Link>
            에 동의하는 것으로 간주됩니다.
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-base font-semibold">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (userType === "company" ? "파트너 가입 신청" : "가입하기")}
          </Button>
        </form>

        <Separator className="my-6" />

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
