"use client";

import { Suspense, useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, Phone } from "lucide-react";
import { updateProfile, updatePassword } from "../actions";
import { createClient } from "@/lib/supabase/client";

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requirePhone = searchParams.get("require_phone") === "true";
  const [profile, setProfile] = useState<{ name: string; email: string; phone: string | null } | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("name, email, phone").eq("id", user.id).single();
        setProfile(data);
        // OAuth 사용자 여부 확인 (provider가 email이 아닌 경우)
        const providers = user.app_metadata?.providers as string[] | undefined;
        if (providers?.some((p: string) => p !== "email")) {
          setIsOAuthUser(true);
        }
      }
    };
    fetchProfile();
  }, []);

  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [profileMsg, setProfileMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileMsg(null);
    const formData = new FormData(e.currentTarget);
    startProfileTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setProfileMsg({ type: "error", text: result.error });
      } else {
        setProfileMsg({ type: "success", text: "프로필이 저장되었습니다." });
        if (requirePhone) {
          router.replace("/mypage/settings");
        }
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMsg(null);
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        type: "error",
        text: "새 비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    startPasswordTransition(async () => {
      const result = await updatePassword(formData);
      if (result.error) {
        setPasswordMsg({ type: "error", text: result.error });
      } else {
        setPasswordMsg({
          type: "success",
          text: "비밀번호가 변경되었습니다.",
        });
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-500 mt-1">내 정보를 관리하세요</p>
      </div>

      {requirePhone && !profile?.phone && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Phone className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">전화번호 입력이 필요합니다</p>
            <p className="text-sm text-amber-700 mt-0.5">
              서비스 이용을 위해 전화번호를 입력해주세요. 견적 요청, 상담 등에 사용됩니다.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleProfileSubmit}>
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">프로필</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
              {profile?.name?.charAt(0) || "?"}
            </div>
            <Button type="button" variant="outline" className="rounded-xl">
              <Upload className="w-4 h-4 mr-2" /> 사진 변경
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>이름</Label>
              <Input
                name="name"
                key={profile?.name}
                defaultValue={profile?.name || ""}
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label>
                전화번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                name="phone"
                key={profile?.phone}
                defaultValue={profile?.phone || ""}
                placeholder="010-0000-0000"
                required
                className={`mt-1.5 h-11 rounded-xl ${requirePhone && !profile?.phone ? "ring-2 ring-amber-400" : ""}`}
              />
            </div>
          </div>
          <div>
            <Label>이메일</Label>
            <Input
              defaultValue={profile?.email || ""}
              key={profile?.email}
              className="mt-1.5 h-11 rounded-xl"
              readOnly
            />
          </div>
          <div>
            <Label>주소</Label>
            <Input
              placeholder="주소를 입력하세요"
              className="mt-1.5 h-11 rounded-xl"
            />
          </div>
          {profileMsg && (
            <div
              className={`text-sm rounded-xl p-3 ${profileMsg.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
            >
              {profileMsg.text}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={profilePending}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8"
            >
              {profilePending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              프로필 저장
            </Button>
          </div>
        </Card>
      </form>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">알림 설정</h2>
        <div className="space-y-3">
          {[
            "견적 관련 알림",
            "프로젝트 진행 알림",
            "Flotren 관리 알림",
            "마케팅 알림",
          ].map((label) => (
            <label
              key={label}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm text-gray-700">{label}</span>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-gray-300 text-green-600"
              />
            </label>
          ))}
        </div>
      </Card>

      {isOAuthUser ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">비밀번호 변경</h2>
          <p className="text-sm text-gray-500">
            소셜 로그인(Google/Kakao)으로 가입한 계정은 비밀번호 변경이 필요하지 않습니다.
            로그인 시 해당 소셜 계정을 이용해주세요.
          </p>
        </Card>
      ) : (
        <form onSubmit={handlePasswordSubmit}>
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">비밀번호 변경</h2>
            <div>
              <Label>현재 비밀번호</Label>
              <Input
                name="currentPassword"
                type="password"
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label>새 비밀번호</Label>
              <Input
                name="newPassword"
                type="password"
                className="mt-1.5 h-11 rounded-xl"
                required
              />
            </div>
            <div>
              <Label>비밀번호 확인</Label>
              <Input
                name="confirmPassword"
                type="password"
                className="mt-1.5 h-11 rounded-xl"
                required
              />
            </div>
            {passwordMsg && (
              <div
                className={`text-sm rounded-xl p-3 ${passwordMsg.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
              >
                {passwordMsg.text}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={passwordPending}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8"
              >
                {passwordPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                비밀번호 변경
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}

export default function CustomerSettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
