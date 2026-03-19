import Link from "next/link";
import { Leaf } from "lucide-react";

const SERVICE_LINKS = [
  { label: "포트폴리오 탐색", href: "/explore" },
  { label: "조경회사 찾기", href: "/companies" },
  { label: "무료 견적", href: "/quote" },
  { label: "블로그", href: "/blog" },
  { label: "Flotren 조경관리", href: "/flotren" },
];

const SUPPORT_LINKS = [
  { label: "회사 소개", href: "/about" },
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "고객센터", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top: Logo + Service links row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pb-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="text-base font-bold text-gray-900">
              GardenHome
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {SERVICE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Middle: Links columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-b border-gray-200">
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              서비스
            </h4>
            <ul className="space-y-2">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              고객지원
            </h4>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              연락처
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>이메일: innous@kakao.com</li>
              <li>운영시간: 09:00~18:00</li>
              <li>경기도 성남시 수정구</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              파트너
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link
                  href="/partner/join"
                  className="hover:text-gray-700 transition-colors"
                >
                  업체 등록
                </Link>
              </li>
              <li>
                <Link
                  href="/partner/dashboard"
                  className="hover:text-gray-700 transition-colors"
                >
                  파트너 센터
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: Company info */}
        <div className="pt-4 pb-2">
          <p className="text-xs text-gray-400 leading-relaxed">
            주식회사 이노어스 | 대표: 김승용 |
            주소: 경기도 성남시 수정구 금토로 52, 경기스타트업브릿지 E동 803호 |
            이메일: innous@kakao.com
          </p>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} GardenHome. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link
              href="/terms"
              className="hover:text-gray-600 transition-colors"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="hover:text-gray-600 transition-colors font-semibold"
            >
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
