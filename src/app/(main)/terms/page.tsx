import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | GardenHome",
  description: "GardenHome 서비스 이용약관",
};

export default function TermsPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제1조 (목적)
            </h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관은 조경홈(이하 &quot;회사&quot;)이 운영하는 GardenHome
              플랫폼(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자
              간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로
              합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제2조 (정의)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                &quot;서비스&quot;란 회사가 제공하는 조경 관련 중개 플랫폼으로,
                조경 전문 업체와 고객을 연결하는 온라인 서비스를 의미합니다.
              </li>
              <li>
                &quot;회원&quot;이란 본 약관에 동의하고 회사와 이용 계약을
                체결하여 서비스를 이용하는 자를 말합니다.
              </li>
              <li>
                &quot;파트너&quot;란 회사에 사업자 등록을 완료하고 서비스를 통해
                조경 시공 및 관련 서비스를 제공하는 전문 업체를 말합니다.
              </li>
              <li>
                &quot;견적&quot;이란 고객이 요청한 조경 작업에 대해 파트너가
                제시하는 예상 비용 및 작업 내역을 의미합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제3조 (약관의 효력)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게
                공지함으로써 효력이 발생합니다.
              </li>
              <li>
                회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수
                있으며, 개정 시 적용 일자 및 개정 사유를 명시하여 현행 약관과
                함께 서비스 내에 7일 전부터 공지합니다.
              </li>
              <li>
                회원이 개정 약관에 동의하지 않는 경우 서비스 이용을 중단하고
                탈퇴할 수 있습니다. 개정 약관 시행일 이후에도 서비스를 계속
                이용하는 경우 약관 변경에 동의한 것으로 간주합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제4조 (서비스 이용)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                서비스 이용은 회사의 서비스 승낙 시점부터 가능하며, 연중무휴
                24시간 제공을 원칙으로 합니다. 단, 시스템 점검 등의 사유로 일시
                중단될 수 있습니다.
              </li>
              <li>
                회원은 서비스 이용 시 관련 법령, 본 약관, 이용 안내 및 서비스
                내에서 공지한 주의사항을 준수하여야 합니다.
              </li>
              <li>
                회원은 타인의 개인정보를 도용하거나 허위 정보를 등록하여서는 안
                됩니다.
              </li>
              <li>
                회사는 서비스의 품질 향상을 위해 서비스 내용을 변경할 수 있으며,
                이 경우 변경 내용을 사전에 공지합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제5조 (회원 가입)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                회원 가입은 이용자가 약관에 동의한 후 회원 가입 신청을 하고,
                회사가 이를 승낙함으로써 체결됩니다.
              </li>
              <li>
                회사는 다음 각 호에 해당하는 경우 회원 가입을 거부하거나 사후에
                이용 계약을 해지할 수 있습니다.
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>타인의 명의를 이용한 경우</li>
                  <li>허위 정보를 기재한 경우</li>
                  <li>
                    기타 회원으로 등록하는 것이 서비스 운영에 현저한 지장을
                    초래하는 경우
                  </li>
                </ul>
              </li>
              <li>
                회원은 가입 시 등록한 정보에 변경이 있는 경우 즉시 수정하여야
                합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제6조 (회원 탈퇴)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                회원은 언제든지 서비스 내 설정 메뉴를 통해 탈퇴를 요청할 수
                있으며, 회사는 즉시 탈퇴를 처리합니다.
              </li>
              <li>
                탈퇴 시 회원의 개인정보는 관련 법령에서 정한 보유 기간이 경과한
                후 파기됩니다.
              </li>
              <li>
                진행 중인 거래가 있는 경우, 해당 거래가 완료된 후 탈퇴가
                처리됩니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제7조 (서비스 제공)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                회사는 다음과 같은 서비스를 제공합니다.
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>조경 전문 업체 검색 및 정보 제공</li>
                  <li>견적 요청 및 비교 서비스</li>
                  <li>조경 포트폴리오 열람 서비스</li>
                  <li>조경 관련 콘텐츠 및 블로그 서비스</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
              </li>
              <li>
                회사는 조경 업체와 고객 간의 거래를 중개하는 플랫폼을 제공하며,
                실제 시공에 대한 책임은 해당 파트너에게 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제8조 (면책)
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등
                불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 면합니다.
              </li>
              <li>
                회사는 회원 간 또는 회원과 파트너 간에 발생한 분쟁에 대해 개입할
                의무를 부담하지 않으며, 이로 인한 손해를 배상할 책임이 없습니다.
              </li>
              <li>
                회사는 회원이 서비스에 게재한 정보, 자료의 신뢰도 및 정확성에
                대해 책임을 지지 않습니다.
              </li>
              <li>
                회사는 서비스를 통해 연결된 파트너의 시공 품질, 하자 등에 대해
                직접적인 책임을 부담하지 않습니다. 단, 회사는 분쟁 해결을 위한
                중재 노력을 할 수 있습니다.
              </li>
            </ol>
          </section>

          <div className="border-t border-gray-200 pt-6 mt-10">
            <p className="text-sm text-gray-500">
              본 약관은 2025년 1월 1일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
