import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | GardenHome",
  description: "GardenHome 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          개인정보처리방침
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          조경홈(이하 &quot;회사&quot;)은 개인정보보호법 등 관련 법령에 따라
          이용자의 개인정보를 보호하고, 이와 관련한 고충을 원활하게 처리할 수
          있도록 다음과 같은 개인정보처리방침을 수립하여 공개합니다.
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제1조 (수집하는 개인정보)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  필수 수집 항목
                </h3>
                <p className="text-sm text-gray-600">
                  이름, 이메일 주소, 휴대전화 번호, 비밀번호
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  선택 수집 항목
                </h3>
                <p className="text-sm text-gray-600">
                  주소, 프로필 사진, 관심 분야
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  자동 수집 항목
                </h3>
                <p className="text-sm text-gray-600">
                  IP 주소, 쿠키, 방문 기록, 서비스 이용 기록, 기기 정보
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  파트너 추가 수집 항목
                </h3>
                <p className="text-sm text-gray-600">
                  사업자등록번호, 대표자명, 사업장 주소, 포트폴리오 자료
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제2조 (개인정보 수집 목적)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              수집한 개인정보는 다음의 목적을 위해 활용됩니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>회원 가입 및 본인 확인, 회원 관리</li>
              <li>조경 견적 요청 및 파트너 매칭 서비스 제공</li>
              <li>서비스 개선 및 신규 서비스 개발을 위한 통계 분석</li>
              <li>고객 문의 및 불만 처리, 공지사항 전달</li>
              <li>마케팅 및 광고 활용 (별도 동의 시)</li>
              <li>부정 이용 방지 및 서비스 안정성 확보</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제3조 (개인정보 보유 기간)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              회사는 개인정보 수집 목적이 달성된 후에는 해당 정보를 지체 없이
              파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 아래 기간 동안
              보관합니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-800">
                      보존 항목
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-800">
                      보존 기간
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-800">
                      근거 법령
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      계약 또는 청약 철회 기록
                    </td>
                    <td className="border border-gray-200 px-4 py-2">5년</td>
                    <td className="border border-gray-200 px-4 py-2">
                      전자상거래법
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      대금 결제 및 재화 공급 기록
                    </td>
                    <td className="border border-gray-200 px-4 py-2">5년</td>
                    <td className="border border-gray-200 px-4 py-2">
                      전자상거래법
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      소비자 불만 또는 분쟁 처리 기록
                    </td>
                    <td className="border border-gray-200 px-4 py-2">3년</td>
                    <td className="border border-gray-200 px-4 py-2">
                      전자상거래법
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      웹사이트 방문 기록
                    </td>
                    <td className="border border-gray-200 px-4 py-2">3개월</td>
                    <td className="border border-gray-200 px-4 py-2">
                      통신비밀보호법
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제4조 (개인정보 제3자 제공)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
              다만, 다음의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>이용자가 사전에 동의한 경우</li>
              <li>
                견적 요청 시 해당 파트너에게 연락처 정보 제공 (서비스 이용을 위해
                필수적이며 견적 요청 시 별도 안내)
              </li>
              <li>
                법령에 의거하거나 수사기관의 요청에 의한 경우
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제5조 (개인정보 처리 위탁)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              회사는 서비스 운영을 위해 다음과 같이 개인정보 처리 업무를
              위탁하고 있습니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-800">
                      수탁 업체
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-800">
                      위탁 업무
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      클라우드 서비스 제공업체
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      데이터 저장 및 서버 운영
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">
                      SMS/알림 서비스 제공업체
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      문자 및 알림 발송
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제6조 (이용자의 권리)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>개인정보 열람 요청</li>
              <li>개인정보 정정 및 삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
              <li>회원 탈퇴를 통한 개인정보 수집 및 이용 동의 철회</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              위 권리 행사는 서비스 내 설정 메뉴 또는 고객센터를 통해 가능하며,
              회사는 지체 없이 필요한 조치를 취합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              제7조 (개인정보 보호책임자)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              회사는 개인정보 처리에 관한 업무를 총괄하고, 이용자의 불만 처리 및
              피해 구제를 위해 다음과 같이 개인정보 보호책임자를 지정하고
              있습니다.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">개인정보 보호책임자:</span>{" "}
                GardenHome 개인정보보호팀
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">이메일:</span>{" "}
                privacy@gardenhome.kr
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">전화:</span> 02-0000-0000
              </p>
            </div>
            <p className="text-gray-600 text-sm mt-4 leading-relaxed">
              기타 개인정보 침해에 대한 신고 및 상담은 한국인터넷진흥원(KISA)
              개인정보침해신고센터(privacy.kisa.or.kr, 118) 또는 개인정보
              분쟁조정위원회(www.kopico.go.kr, 1833-6972)로 문의하실 수
              있습니다.
            </p>
          </section>

          <div className="border-t border-gray-200 pt-6 mt-10">
            <p className="text-sm text-gray-500">
              본 개인정보처리방침은 2025년 1월 1일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
