import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  TrendingUp,
  Shield,
  FileText,
  BarChart3,
  MessageCircle,
  Camera,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";
import PartnerApplyForm from "./apply-form";

export const metadata: Metadata = {
  title: "파트너 입점 안내",
  description:
    "조경홈에 입점하고 더 많은 고객을 만나보세요. 무료 입점, 견적 연결, 포트폴리오 노출까지.",
};

const BENEFITS = [
  {
    icon: Users,
    title: "신규 고객 유입",
    desc: "조경을 찾는 고객들이 직접 견적을 요청합니다. 영업 없이도 새로운 고객을 만나보세요.",
  },
  {
    icon: Camera,
    title: "포트폴리오 노출",
    desc: "시공 사례를 등록하면 메인 페이지와 검색 결과에 노출되어 브랜드 인지도가 올라갑니다.",
  },
  {
    icon: FileText,
    title: "견적 관리 시스템",
    desc: "견적 요청 확인부터 견적서 작성, 발송까지 전용 대시보드에서 편리하게 관리하세요.",
  },
  {
    icon: MessageCircle,
    title: "실시간 채팅 상담",
    desc: "고객과 실시간 채팅으로 소통하세요. 빠른 응답이 계약 전환율을 높입니다.",
  },
  {
    icon: BarChart3,
    title: "통계 & 인사이트",
    desc: "견적 요청 수, 계약 전환율 등 경영 데이터를 한눈에 파악할 수 있습니다.",
  },
  {
    icon: Shield,
    title: "검증된 플랫폼",
    desc: "사업자등록증 인증을 거친 검증된 업체만 입점하여 고객 신뢰도가 높습니다.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "회원가입 후 입점 신청",
    desc: "일반 회원으로 가입 후 사업자등록증을 제출하면 입점 신청이 완료됩니다.",
  },
  {
    step: "02",
    title: "관리자 승인",
    desc: "영업일 기준 1~2일 내에 사업자 정보를 확인하고 승인해드립니다.",
  },
  {
    step: "03",
    title: "포트폴리오 등록",
    desc: "시공 사례, 회사 소개를 등록하면 고객에게 바로 노출됩니다.",
  },
  {
    step: "04",
    title: "견적 요청 수신",
    desc: "고객의 견적 요청이 들어오면 알림을 받고, 견적서를 작성해 보내세요.",
  },
];

const FAQS = [
  {
    q: "입점 비용이 있나요?",
    a: "아닙니다. 조경홈 입점은 완전 무료입니다. 별도의 월 이용료나 가입비가 없습니다.",
  },
  {
    q: "어떤 조경회사가 입점할 수 있나요?",
    a: "사업자등록증을 보유한 조경 관련 업체라면 누구나 신청 가능합니다. 조경 시공, 정원 설계, 식물 관리 등 다양한 분야의 업체를 환영합니다.",
  },
  {
    q: "승인까지 얼마나 걸리나요?",
    a: "사업자등록증 확인 후 영업일 기준 1~2일 내에 승인이 완료됩니다.",
  },
  {
    q: "수수료 구조는 어떻게 되나요?",
    a: "현재 오픈 기념으로 수수료 없이 운영 중입니다. 추후 변경 시 사전에 충분히 안내드리겠습니다.",
  },
  {
    q: "기존 포트폴리오를 가져올 수 있나요?",
    a: "네, 파트너 대시보드에서 사진과 설명을 직접 등록할 수 있습니다. 이미지 자동 최적화 기능도 제공합니다.",
  },
];

export default function PartnerJoinPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-500 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-6">
            <Building2 className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              파트너 모집 중
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            조경회사라면,
            <br />
            조경홈에서 고객을 만나세요
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            무료 입점으로 포트폴리오를 등록하고, 조경을 찾는 고객의 견적 요청을
            직접 받아보세요. 영업 없이도 사업이 성장합니다.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#apply">
              <Button
                size="lg"
                className="bg-white text-green-700 hover:bg-white/90 rounded-full px-8 h-14 text-lg font-bold shadow-lg"
              >
                무료 입점 신청하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>
          <p className="text-white/60 text-sm mt-4">
            가입비 · 월 이용료 · 수수료 없음
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              조경홈 파트너가 되면
            </h2>
            <p className="text-gray-500 text-lg">
              입점만 하면 고객이 찾아옵니다
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="border border-gray-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {b.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              입점 절차
            </h2>
            <p className="text-gray-500 text-lg">
              간단한 4단계로 파트너가 되세요
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="bg-white rounded-2xl p-6 h-full">
                  <span className="text-3xl font-bold text-green-200">
                    {s.step}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-3 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              파트너 전용 대시보드
            </h2>
            <p className="text-gray-500 text-lg">
              사업에 필요한 모든 기능을 한 곳에서
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: FileText,
                title: "견적 관리",
                desc: "견적 요청 확인, 견적서 작성 및 발송",
              },
              {
                icon: Camera,
                title: "포트폴리오 관리",
                desc: "시공 사례 등록, 수정, 임시저장",
              },
              {
                icon: BarChart3,
                title: "통계 분석",
                desc: "견적 요청 수, 계약 전환율, 매출 추이",
              },
              {
                icon: MessageCircle,
                title: "채팅 상담",
                desc: "고객과 실시간 1:1 채팅",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 bg-gray-50 rounded-xl p-5"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-0.5">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              자주 묻는 질문
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <span className="text-green-600 shrink-0">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply Form */}
      <section id="apply" className="py-20 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              파트너 입점 신청
            </h2>
            <p className="text-gray-500 text-lg">
              아래 정보를 입력하고 무료로 입점하세요
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <PartnerApplyForm />
          </div>
        </div>
      </section>
    </div>
  );
}
