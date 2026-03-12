"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/mypage/settings`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    });
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              이메일을 확인해주세요
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              비밀번호 재설정 링크가 이메일로 전송되었습니다.
              <br />
              메일함을 확인해주세요.
            </p>
            <Link href="/login">
              <Button
                variant="outline"
                className="rounded-xl h-12 w-full text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                로그인으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h1>
          <p className="text-sm text-gray-500 mt-2">
            가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              이메일
            </Label>
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

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-base font-semibold"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "재설정 링크 보내기"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link
            href="/login"
            className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
