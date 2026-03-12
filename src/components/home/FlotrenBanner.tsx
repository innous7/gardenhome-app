import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const features = [
  "전문 관리사가 정기적으로 방문하여 정원을 관리합니다",
  "전정, 시비, 병충해 방제 등 식물 건강을 책임집니다",
  "매 방문 후 사진과 함께 상세한 관리 리포트를 제공합니다",
  "정원 관련 궁금한 점을 언제든 전문가에게 상담하세요",
];

export default function FlotrenBanner() {
  return (
    <section className="bg-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text side */}
          <div className="flex-1">
            <span className="inline-block bg-green-600 text-white text-xs px-3 py-1 rounded-full">
              Flotren
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              시공 후 관리까지, 플로트렌
            </h2>
            <p className="text-gray-600 mt-3">
              Flotren이 당신의 정원을 지속적으로 관리합니다. 월정액 구독으로
              사계절 아름다운 정원을 유지하세요.
            </p>
            <ul className="mt-6 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/flotren" className="inline-block mt-8">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8">
                조경관리 알아보기
              </Button>
            </Link>
          </div>

          {/* Visual side */}
          <div className="flex-1 hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                이번 달 관리 리포트
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">방문</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-green-100 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-green-500 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">2회</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">전정</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-green-100 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-green-500 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">완료</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">시비</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-green-100 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-green-500 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">완료</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
