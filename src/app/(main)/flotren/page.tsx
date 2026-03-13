"use client";

import Link from "next/link";
import { Check, Sprout, Calendar, FileText, Headphones, Shield, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLink } from "@/components/auth/AuthLink";
import { FLOTREN_PLANS } from "@/lib/constants";

const features = [
  { icon: Calendar, title: "정기 방문 관리", desc: "전문 관리사가 정기적으로 방문하여 잔디 관리, 전정, 시비 등을 수행합니다." },
  { icon: Sprout, title: "식물 건강 관리", desc: "병충해 예방 및 치료, 영양 관리, 계절별 식물 케어를 제공합니다." },
  { icon: FileText, title: "관리 리포트", desc: "매 방문 후 사진과 함께 상세한 관리 리포트를 앱으로 확인하세요." },
  { icon: Headphones, title: "전문가 상담", desc: "정원 관련 궁금한 점을 언제든 전문가에게 상담할 수 있습니다." },
  { icon: Shield, title: "식물 보증", desc: "관리 중 식물이 고사할 경우, 프리미엄 플랜은 교체를 보장합니다." },
  { icon: Star, title: "계절 특별 관리", desc: "봄·가을 대청소, 월동 준비 등 계절별 특별 관리를 제공합니다." },
];

const planDetails: Record<string, { features: string[] }> = {
  BASIC: {
    features: [
      "월 1회 방문",
      "잔디 관리",
      "잡초 제거",
      "기본 전정",
      "간단한 정리",
    ],
  },
  STANDARD: {
    features: [
      "월 2회 방문",
      "잔디 관리 + 전정",
      "잡초 제거 + 시비",
      "병충해 점검",
      "봄/가을 특별 관리",
      "분기별 리포트",
      "연 2회 식물 교체",
    ],
  },
  PREMIUM: {
    features: [
      "주 1회 방문",
      "풀 케어 관리",
      "병충해 방제",
      "수경시설 관리",
      "사계절 관리",
      "월별 리포트",
      "연 4회 식물 교체",
      "긴급 출동 포함",
      "전문가 직통 상담",
    ],
  },
};

export default function FlotrenPage() {
  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 py-20 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-green-200 text-sm font-semibold mb-6">
            Flotren 조경관리
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            조경은 시공으로 끝나지 않습니다
            <br />
            <span className="text-green-300">Flotren</span>이 관리합니다
          </h1>
          <p className="text-lg text-green-100/80 max-w-2xl mx-auto leading-relaxed">
            전문 관리사가 정기적으로 방문하여 당신의 정원을 사계절 아름답게 유지합니다.
            월정액 구독으로 편리하게 관리하세요.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Flotren 서비스</h2>
            <p className="text-gray-500 mt-2">전문적이고 체계적인 정원 관리 서비스</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">구독 플랜</h2>
            <p className="text-gray-500 mt-2">정원 규모와 필요에 맞는 플랜을 선택하세요</p>
            <p className="text-xs text-gray-400 mt-1">* 정원 면적/복잡도에 따라 가격이 변동될 수 있습니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Object.entries(FLOTREN_PLANS).map(([key, plan]) => {
              const isPopular = key === "STANDARD";
              return (
                <div
                  key={key}
                  className={`bg-white rounded-2xl p-8 relative ${
                    isPopular
                      ? "ring-2 ring-green-600 shadow-xl scale-105"
                      : "shadow-sm border border-gray-100"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                      인기
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.visits}</p>
                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">원~/월</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {planDetails[key].features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <AuthLink href={`/flotren/apply?plan=${key}`} message="구독을 신청하려면 로그인이 필요합니다.">
                    <Button
                      className={`w-full rounded-full ${
                        isPopular
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      구독 신청하기
                    </Button>
                  </AuthLink>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            정원 관리, Flotren에 맡기세요
          </h2>
          <p className="text-gray-500 mb-8">
            무료 정원 상태 진단부터 시작하세요.
            전문 관리사가 방문하여 정원 상태를 점검하고 맞춤 관리 플랜을 제안합니다.
          </p>
          <AuthLink href="/flotren/apply" message="상담을 신청하려면 로그인이 필요합니다.">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-14 text-lg font-semibold">
              무료 상담 신청 <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </AuthLink>
        </div>
      </section>
    </div>
  );
}
