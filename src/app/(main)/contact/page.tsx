"use client";

import { useState } from "react";
import { ChevronDown, Mail, Clock } from "lucide-react";

const faqs = [
  {
    question: "GardenHome은 어떤 서비스인가요?",
    answer:
      "GardenHome은 조경 시공을 원하는 고객과 검증된 조경 전문 업체를 연결해주는 중개 플랫폼입니다. 무료 견적 비교, 포트폴리오 탐색, 프로젝트 관리, 그리고 Flotren 조경관리 구독 서비스까지 제공합니다.",
  },
  {
    question: "견적 요청은 어떻게 하나요?",
    answer:
      "상단 메뉴의 '무료 견적' 버튼을 클릭한 후, 조경 유형·면적·위치·예산 등 간단한 정보를 입력하시면 됩니다. 요청이 접수되면 등록된 조경회사들이 견적서를 보내드리며, 여러 업체의 견적을 비교하여 선택할 수 있습니다.",
  },
  {
    question: "견적 비용이 발생하나요?",
    answer:
      "아닙니다. GardenHome에서의 견적 요청과 비교는 완전히 무료입니다. 고객님은 비용 부담 없이 여러 업체의 견적을 받아보고 비교하실 수 있습니다.",
  },
  {
    question: "등록된 조경회사는 어떻게 검증되나요?",
    answer:
      "모든 파트너 업체는 사업자등록증 확인, 포트폴리오 심사, 시공 이력 검증 과정을 거쳐 등록됩니다. 또한 실제 고객 리뷰를 통해 서비스 품질을 지속적으로 관리합니다.",
  },
  {
    question: "시공 후 문제가 생기면 어떻게 하나요?",
    answer:
      "시공 완료 후 하자가 발생한 경우, 플랫폼 내 프로젝트 관리 메뉴에서 해당 내용을 접수하실 수 있습니다. GardenHome이 고객과 시공 업체 사이에서 원활한 A/S 처리를 지원합니다.",
  },
  {
    question: "Flotren(플로트렌) 조경관리 구독은 무엇인가요?",
    answer:
      "Flotren은 전문 관리사가 정기적으로 방문하여 정원을 관리해주는 구독 서비스입니다. 잔디 관리, 수목 전정, 병충해 관리, 계절별 식재 등을 전문가가 체계적으로 관리하여 항상 아름다운 정원을 유지할 수 있습니다.",
  },
  {
    question: "조경회사로 등록하려면 어떻게 하나요?",
    answer:
      "하단의 '업체 등록' 또는 상단의 '파트너 등록' 메뉴를 통해 신청할 수 있습니다. 사업자등록증과 포트폴리오를 제출하시면 심사를 거쳐 파트너로 등록됩니다.",
  },
  {
    question: "어떤 종류의 조경 서비스를 이용할 수 있나요?",
    answer:
      "정원 설계·시공, 옥상 조경, 베란다 가드닝, 상업 시설 조경, 아파트 단지 조경, 수목 관리, 잔디 시공, 조경 리모델링 등 다양한 조경 서비스를 이용하실 수 있습니다.",
  },
  {
    question: "회원 가입 없이도 이용할 수 있나요?",
    answer:
      "포트폴리오 탐색과 조경회사 정보 확인은 비회원도 가능합니다. 다만, 견적 요청·채팅·리뷰 작성 등의 기능은 간편한 회원 가입 후 이용하실 수 있습니다.",
  },
  {
    question: "결제는 어떻게 이루어지나요?",
    answer:
      "견적 확정 후 조경회사와 직접 계약을 체결하며, 결제 조건은 계약 내용에 따릅니다. GardenHome은 계약서 작성과 프로젝트 진행 관리를 지원하여 안전한 거래를 도와드립니다.",
  },
];

export default function ContactPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            고객센터
          </h1>
          <p className="text-gray-600 text-lg">
            자주 묻는 질문을 확인하시고, 추가 문의가 있으시면 아래 연락처로
            문의해주세요.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            자주 묻는 질문
          </h2>
          <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {faqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between py-5 text-left gap-4"
                >
                  <span className="text-base font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="pb-5 pr-8">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            문의하기
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">이메일 문의</h3>
                <p className="text-sm text-gray-600 mb-2">
                  궁금한 점이나 건의사항을 보내주세요.
                </p>
                <a
                  href="mailto:innous@kakao.com"
                  className="text-sm text-green-600 font-medium hover:underline"
                >
                  innous@kakao.com
                </a>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">운영시간</h3>
                <p className="text-sm text-gray-600 mb-1">
                  평일 09:00 ~ 18:00
                </p>
                <p className="text-xs text-gray-400">
                  주말 및 공휴일 휴무 (이메일 문의는 24시간 접수 가능)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
