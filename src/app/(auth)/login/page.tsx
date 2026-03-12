"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn, signInWithGoogle, signInWithKakao } from "../actions";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-sm text-gray-500 mt-2">GardenHome에 오신 것을 환영합니다</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">
            {error === "Invalid login credentials" ? "이메일 또는 비밀번호가 올바르지 않습니다." : error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="password" className="text-sm font-medium">비밀번호</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                className="pl-10 pr-10 h-12 rounded-xl"
                required
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="rounded border-gray-300" />
              로그인 유지
            </label>
            <Link href="/forgot-password" className="text-green-600 hover:text-green-700 font-medium">
              비밀번호 찾기
            </Link>
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-base font-semibold">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "로그인"}
          </Button>
        </form>

        <Separator className="my-6" />

        <div className="space-y-3">
          <form action={signInWithGoogle}>
            <Button type="submit" variant="outline" className="w-full h-12 rounded-xl text-sm">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#FFC107" d="M21.805 10.023H21V10H12v4h5.651A5.998 5.998 0 0 1 6 12a6 6 0 0 1 6-6c1.53 0 2.921.577 3.98 1.52L18.81 4.69A9.954 9.954 0 0 0 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10c0-.67-.069-1.325-.195-1.977z"/><path fill="#FF3D00" d="m3.153 7.345 3.286 2.41A5.997 5.997 0 0 1 12 6c1.53 0 2.921.577 3.98 1.52L18.81 4.69A9.954 9.954 0 0 0 12 2 9.994 9.994 0 0 0 3.153 7.345z"/><path fill="#4CAF50" d="M12 22c2.583 0 4.93-.988 6.704-2.596l-3.095-2.619A5.955 5.955 0 0 1 12 18a5.997 5.997 0 0 1-5.641-3.973L3.098 16.54C4.753 19.778 8.114 22 12 22z"/><path fill="#1976D2" d="M21.805 10.023H21V10H12v4h5.651a6.02 6.02 0 0 1-2.042 2.785l3.095 2.619C18.485 19.602 22 17 22 12c0-.67-.069-1.325-.195-1.977z"/></svg>
              Google로 로그인
            </Button>
          </form>
          <form action={signInWithKakao}>
            <Button type="submit" variant="outline" className="w-full h-12 rounded-xl text-sm bg-[#FEE500] hover:bg-[#FDD800] border-[#FEE500] text-[#3C1E1E]">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#3C1E1E" d="M12 3C6.477 3 2 6.477 2 11c0 2.89 1.898 5.42 4.745 6.855-.152.555-.874 3.18-.9 3.39 0 0-.018.152.08.21.098.058.213.024.213.024.281-.039 3.252-2.13 3.767-2.49.684.1 1.39.151 2.095.151 5.523 0 10-3.477 10-8S17.523 3 12 3z"/></svg>
              카카오로 로그인
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          아직 회원이 아니신가요?{" "}
          <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
