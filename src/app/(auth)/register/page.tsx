"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2, CheckCircle2, XCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { signUp } from "../actions";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 이메일 중복 체크
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const emailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkEmailDuplicate = useCallback(async (emailValue: string) => {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", emailValue)
      .maybeSingle();
    setEmailStatus(data ? "taken" : "available");
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    if (!value) { setEmailStatus("idle"); return; }
    emailTimerRef.current = setTimeout(() => checkEmailDuplicate(value), 500);
  };

  // 비밀번호 일치 확인
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const passwordMatch = passwordConfirm === "" ? "idle" : password === passwordConfirm ? "match" : "mismatch";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("role", "CUSTOMER");

    const pw = formData.get("password") as string;
    const pwConfirm = formData.get("passwordConfirm") as string;
    if (pw !== pwConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (pw.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
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
                value={email}
                onChange={handleEmailChange}
                className={`pl-10 pr-10 h-12 rounded-xl ${emailStatus === "taken" ? "border-red-400 focus:ring-red-400" : emailStatus === "available" ? "border-green-400 focus:ring-green-400" : ""}`}
                required
              />
              {emailStatus === "checking" && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              )}
              {emailStatus === "available" && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
              {emailStatus === "taken" && (
                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>
            {emailStatus === "taken" && (
              <p className="text-xs text-red-500 mt-1">이미 가입된 이메일입니다.</p>
            )}
            {emailStatus === "available" && (
              <p className="text-xs text-green-600 mt-1">사용 가능한 이메일입니다.</p>
            )}
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
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium">비밀번호</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="8자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={`pl-10 pr-10 h-12 rounded-xl ${passwordMatch === "mismatch" ? "border-red-400 focus:ring-red-400" : passwordMatch === "match" ? "border-green-400 focus:ring-green-400" : ""}`}
                required
                minLength={8}
              />
              {passwordMatch === "match" && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
              {passwordMatch === "mismatch" && (
                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>
            {passwordMatch === "mismatch" && (
              <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
            )}
            {passwordMatch === "match" && (
              <p className="text-xs text-green-600 mt-1">비밀번호가 일치합니다.</p>
            )}
          </div>

          <div className="text-xs text-gray-500 pt-2">
            가입 시{" "}
            <Link href="/terms" className="text-green-600 underline">이용약관</Link>
            {" "}및{" "}
            <Link href="/privacy" className="text-green-600 underline">개인정보처리방침</Link>
            에 동의하는 것으로 간주됩니다.
          </div>

          <Button type="submit" disabled={isPending || emailStatus === "taken" || passwordMatch === "mismatch"} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-base font-semibold disabled:opacity-50">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "가입하기"}
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

      {/* 파트너 신청 안내 */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
        <Building2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">조경회사이신가요?</p>
          <p className="text-xs text-green-700 mt-0.5">
            일반 회원으로 가입 후{" "}
            <Link href="/partner/join" className="underline font-semibold">파트너 입점 신청</Link>
            을 진행해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
