import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Users, Shield } from "lucide-react";

const BENEFITS = [
  {
    icon: Users,
    title: "신규 고객 확보",
    desc: "매달 새로운 견적 요청을 받아보세요",
  },
  {
    icon: TrendingUp,
    title: "매출 성장",
    desc: "포트폴리오 노출로 브랜드 인지도 향상",
  },
  {
    icon: Shield,
    title: "검증된 플랫폼",
    desc: "투명한 중개 시스템으로 신뢰도 확보",
  },
];

export default function PartnerRecruitBanner() {
  return (
    <section className="bg-gradient-to-r from-green-700 to-emerald-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left - Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-4">
              <Building2 className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                파트너 모집 중
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
              조경회사라면,
              <br />
              지금 조경홈에 입점하세요
            </h2>
            <p className="text-white/80 text-base mb-8 max-w-md leading-relaxed">
              조경홈과 함께 더 많은 고객을 만나보세요. 무료로 입점하고,
              포트폴리오를 등록하면 견적 요청이 찾아옵니다.
            </p>
            <Link href="/partner/join">
              <Button
                size="lg"
                className="bg-white text-green-700 hover:bg-white/90 rounded-full px-8 h-12 text-base font-semibold shadow-lg"
              >
                무료 입점 신청하기
              </Button>
            </Link>
          </div>

          {/* Right - Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <b.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-base mb-1">
                  {b.title}
                </h3>
                <p className="text-white/70 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
