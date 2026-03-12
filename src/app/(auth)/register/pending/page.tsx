import Link from "next/link";
import { Clock, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPendingPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-yellow-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          가입 신청 완료
        </h1>
        <p className="text-gray-500 mb-6">
          파트너 가입 신청이 접수되었습니다.<br />
          관리자 검토 후 승인이 완료되면 로그인하실 수 있습니다.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">사업자등록증 확인</p>
              <p className="text-xs text-gray-500">제출하신 사업자등록증을 검토합니다.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">관리자 승인</p>
              <p className="text-xs text-gray-500">영업일 기준 1~2일 내 처리됩니다.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">승인 완료</p>
              <p className="text-xs text-gray-500">승인이 완료되면 로그인하여 파트너 서비스를 이용할 수 있습니다.</p>
            </div>
          </div>
        </div>

        <Link href="/login">
          <Button variant="outline" className="w-full rounded-xl h-11">
            <ArrowLeft className="w-4 h-4 mr-2" />
            로그인 페이지로
          </Button>
        </Link>
      </div>
    </div>
  );
}
