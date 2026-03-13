"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthLink } from "@/components/auth/AuthLink";
import { ArrowRight, FileText, Leaf } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Banner */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 aspect-[2/1]">
            <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-center">
              <p className="text-white/80 text-sm font-medium mb-3">
                조경 전문 중개 플랫폼
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                당신이 꿈꾸는 정원,
                <br />
                전문가가 만들어드립니다
              </h1>
              <p className="text-white/80 text-sm sm:text-base mb-6 max-w-md leading-relaxed">
                검증된 조경 전문가와 함께 나만의 정원을 완성하세요.
                무료 견적부터 시공, 사후관리까지 함께합니다.
              </p>
              <div>
                <Link href="/explore">
                  <Button
                    size="lg"
                    className="bg-white text-green-700 hover:bg-white/90 rounded-full px-6 h-12 text-base font-semibold shadow-lg"
                  >
                    포트폴리오 둘러보기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Side Banners */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Top: 무료 견적 받기 */}
            <AuthLink
              href="/quote"
              message="견적을 요청하려면 로그인이 필요합니다."
              className="block rounded-2xl bg-amber-50 p-6 hover:bg-amber-100 transition-colors"
            >
              <div className="flex flex-col h-full justify-center">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="text-lg font-bold text-amber-900 mb-1">
                  무료 견적 받기
                </h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  간단한 정보 입력으로 여러 전문가의 견적을 비교해보세요
                </p>
              </div>
            </AuthLink>

            {/* Bottom: Flotren 조경관리 */}
            <Link
              href="/flotren"
              className="block rounded-2xl bg-emerald-50 p-6 hover:bg-emerald-100 transition-colors"
            >
              <div className="flex flex-col h-full justify-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <Leaf className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900 mb-1">
                  Flotren 조경관리
                </h3>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  정기적인 관리로 정원을 항상 아름답게 유지하세요
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
