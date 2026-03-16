"use client";

import { useState } from "react";
import { Save, Globe, Bell, Shield, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "GardenHome",
    siteDescription: "조경 중개 플랫폼",
    contactEmail: "admin@gardenhome.kr",
    contactPhone: "02-1234-5678",
    autoApproveCompany: false,
    requireEmailVerification: true,
    maxPortfolioImages: 20,
    maxFileSize: 10,
    maintenanceMode: false,
    notifyNewUser: true,
    notifyNewQuote: true,
    notifyNewReview: true,
    notifyNewCompany: true,
    primaryColor: "#16a34a",
    flotrenEnabled: true,
    blogEnabled: true,
  });

  const handleSave = () => {
    // 실제로는 서버 액션으로 저장
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <p className="text-gray-500 mt-1">플랫폼 운영 설정을 관리하세요</p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2"
          onClick={handleSave}
        >
          <Save className="w-4 h-4" />
          {saved ? "저장됨!" : "저장"}
        </Button>
      </div>

      {/* 기본 정보 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">기본 정보</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">사이트명</label>
            <Input
              value={settings.siteName}
              onChange={(e) => updateSetting("siteName", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">사이트 설명</label>
            <Input
              value={settings.siteDescription}
              onChange={(e) => updateSetting("siteDescription", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">관리자 이메일</label>
            <Input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => updateSetting("contactEmail", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">대표 전화번호</label>
            <Input
              value={settings.contactPhone}
              onChange={(e) => updateSetting("contactPhone", e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>
      </Card>

      {/* 보안 및 승인 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">보안 및 승인</h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="조경회사 자동 승인"
            description="새로 등록되는 조경회사를 자동으로 승인합니다"
            checked={settings.autoApproveCompany}
            onChange={(v) => updateSetting("autoApproveCompany", v)}
          />
          <ToggleRow
            label="이메일 인증 필수"
            description="회원가입 시 이메일 인증을 필수로 요구합니다"
            checked={settings.requireEmailVerification}
            onChange={(v) => updateSetting("requireEmailVerification", v)}
          />
          <ToggleRow
            label="유지보수 모드"
            description="유지보수 모드를 활성화하면 관리자 외 접근이 차단됩니다"
            checked={settings.maintenanceMode}
            onChange={(v) => updateSetting("maintenanceMode", v)}
          />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">최대 포트폴리오 이미지</p>
              <p className="text-xs text-gray-500">포트폴리오당 업로드 가능한 최대 이미지 수</p>
            </div>
            <Input
              type="number"
              value={settings.maxPortfolioImages}
              onChange={(e) => updateSetting("maxPortfolioImages", Number(e.target.value))}
              className="w-20 rounded-xl text-center"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">최대 파일 크기 (MB)</p>
              <p className="text-xs text-gray-500">업로드 파일의 최대 크기</p>
            </div>
            <Input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => updateSetting("maxFileSize", Number(e.target.value))}
              className="w-20 rounded-xl text-center"
            />
          </div>
        </div>
      </Card>

      {/* 알림 설정 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-yellow-600" />
          <h2 className="font-semibold text-gray-900">알림 설정</h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="신규 회원가입 알림"
            description="새 회원이 가입할 때 관리자에게 알림"
            checked={settings.notifyNewUser}
            onChange={(v) => updateSetting("notifyNewUser", v)}
          />
          <ToggleRow
            label="견적 요청 알림"
            description="새 견적 요청이 들어올 때 관리자에게 알림"
            checked={settings.notifyNewQuote}
            onChange={(v) => updateSetting("notifyNewQuote", v)}
          />
          <ToggleRow
            label="리뷰 작성 알림"
            description="새 리뷰가 작성될 때 관리자에게 알림"
            checked={settings.notifyNewReview}
            onChange={(v) => updateSetting("notifyNewReview", v)}
          />
          <ToggleRow
            label="조경회사 등록 알림"
            description="새 조경회사가 등록될 때 관리자에게 알림"
            checked={settings.notifyNewCompany}
            onChange={(v) => updateSetting("notifyNewCompany", v)}
          />
        </div>
      </Card>

      {/* 기능 활성화 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900">기능 관리</h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Flotren (조경관리 구독)"
            description="Flotren 구독 서비스 기능을 활성화합니다"
            checked={settings.flotrenEnabled}
            onChange={(v) => updateSetting("flotrenEnabled", v)}
          />
          <ToggleRow
            label="블로그"
            description="블로그 기능을 활성화합니다"
            checked={settings.blogEnabled}
            onChange={(v) => updateSetting("blogEnabled", v)}
          />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">주요 색상</p>
              <p className="text-xs text-gray-500">플랫폼의 주요 테마 색상</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => updateSetting("primaryColor", e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-sm text-gray-500">{settings.primaryColor}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-green-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}
