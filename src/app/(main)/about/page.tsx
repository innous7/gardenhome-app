import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "회사 소개 | GardenHome",
  description:
    "조경의 모든 것, GardenHome. 고객과 조경 전문가를 연결하는 중개 플랫폼입니다.",
};

const values = [
  {
    title: "신뢰",
    description:
      "검증된 조경 전문 업체만을 엄선하여 소개합니다. 실제 시공 사례와 고객 리뷰를 통해 믿을 수 있는 파트너를 찾을 수 있습니다.",
    icon: (
      <svg
        className="w-8 h-8 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    ),
  },
  {
    title: "전문성",
    description:
      "조경 설계부터 시공, 유지관리까지 각 분야의 전문가를 연결합니다. 다양한 포트폴리오를 비교하고 최적의 업체를 선택하세요.",
    icon: (
      <svg
        className="w-8 h-8 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743"
        />
      </svg>
    ),
  },
  {
    title: "편리함",
    description:
      "복잡한 견적 비교를 한 번에. 원하는 조건을 입력하면 여러 업체의 견적을 한눈에 비교하고 최적의 조건을 선택할 수 있습니다.",
    icon: (
      <svg
        className="w-8 h-8 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
        />
      </svg>
    ),
  },
  {
    title: "투명성",
    description:
      "숨겨진 비용 없이 투명한 견적을 제공합니다. 시공 과정과 비용 내역을 상세하게 확인하고 합리적인 의사결정을 할 수 있습니다.",
    icon: (
      <svg
        className="w-8 h-8 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
];

const services = [
  {
    title: "조경 견적 비교",
    description: "한 번의 요청으로 다수의 검증된 조경회사로부터 견적을 받고, 가격과 서비스를 투명하게 비교할 수 있습니다.",
  },
  {
    title: "포트폴리오 탐색",
    description: "실제 시공 사례 사진과 고객 리뷰를 통해 각 조경회사의 전문 분야와 실력을 한눈에 확인할 수 있습니다.",
  },
  {
    title: "프로젝트 관리",
    description: "견적 요청부터 계약, 시공 진행, 완료까지 모든 과정을 플랫폼에서 체계적으로 관리합니다.",
  },
  {
    title: "Flotren 조경관리 구독",
    description: "전문 관리사가 정기적으로 방문하여 정원을 관리해드리는 구독 서비스로, 아름다운 정원을 유지하세요.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-6">
            About GardenHome
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            조경의 모든 것,{" "}
            <span className="text-green-600">GardenHome</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            고객과 조경 전문가를 연결하는 중개 플랫폼.
            <br className="hidden sm:block" />
            아름다운 공간을 만드는 가장 쉽고 합리적인 방법입니다.
          </p>
        </div>
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full text-white" fill="currentColor">
            <path d="M0,60 L0,30 Q720,0 1440,30 L1440,60 Z" />
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                우리의 미션
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                GardenHome은 조경 시장의 정보 비대칭을 해소하고, 누구나 쉽게
                전문 조경 서비스를 이용할 수 있는 환경을 만들어 갑니다.
              </p>
              <p className="text-gray-600 leading-relaxed">
                복잡하고 불투명했던 조경 견적 과정을 플랫폼으로 혁신하여, 고객은
                합리적인 가격에 양질의 서비스를, 파트너는 안정적인 고객 확보를
                경험할 수 있습니다.
              </p>
            </div>
            <div className="bg-green-50 rounded-2xl p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    쉬운 견적 비교
                  </h3>
                  <p className="text-sm text-gray-600">
                    한 번의 요청으로 여러 업체의 견적을 비교할 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    검증된 파트너
                  </h3>
                  <p className="text-sm text-gray-600">
                    등록된 모든 업체는 사업자 인증과 포트폴리오 심사를 거칩니다.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    투명한 프로세스
                  </h3>
                  <p className="text-sm text-gray-600">
                    견적부터 시공 완료까지 모든 과정을 플랫폼에서 관리합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              핵심 가치
            </h2>
            <p className="text-gray-600">
              GardenHome이 추구하는 네 가지 핵심 가치입니다.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              주요 서비스
            </h2>
            <p className="text-gray-600">
              GardenHome이 제공하는 조경 서비스를 소개합니다.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <div
                key={service.title}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info Section */}
      <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              회사 정보
            </h2>
          </div>
          <div className="max-w-2xl mx-auto bg-gray-50 rounded-2xl p-8">
            <dl className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-sm font-semibold text-gray-900 sm:w-32 shrink-0">회사명</dt>
                <dd className="text-sm text-gray-600">주식회사 이노어스</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-sm font-semibold text-gray-900 sm:w-32 shrink-0">대표</dt>
                <dd className="text-sm text-gray-600">김승용</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-sm font-semibold text-gray-900 sm:w-32 shrink-0">소재지</dt>
                <dd className="text-sm text-gray-600">경기도 성남시 수정구 금토로 52, 경기스타트업브릿지 E동 803호</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-sm font-semibold text-gray-900 sm:w-32 shrink-0">이메일</dt>
                <dd className="text-sm text-gray-600">innous@kakao.com</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-sm font-semibold text-gray-900 sm:w-32 shrink-0">서비스</dt>
                <dd className="text-sm text-gray-600">GardenHome (조경 중개 플랫폼) / Flotren (조경관리 구독)</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-green-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            지금 바로 조경 견적을 받아보세요
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            간단한 정보 입력만으로 여러 전문 업체의 견적을 무료로 비교할 수
            있습니다.
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-green-700 font-semibold rounded-full hover:bg-green-50 transition-colors shadow-lg"
          >
            무료 견적 받기
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
