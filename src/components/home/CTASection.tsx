"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthLink } from "@/components/auth/AuthLink";

export default function CTASection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">지금 시작하세요</h2>
        <p className="text-gray-500 mt-2">
          간단한 정보 입력만으로 검증된 조경회사들의 맞춤 견적을 무료로
          받아보세요
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <AuthLink href="/quote" message="견적을 요청하려면 로그인이 필요합니다.">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full h-12 px-8">
              무료 견적 받기
            </Button>
          </AuthLink>
          <Link href="/register/company">
            <Button
              variant="outline"
              className="border border-gray-300 text-gray-700 rounded-full h-12 px-8 hover:bg-gray-100"
            >
              파트너 등록
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
