"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { updateUserRole } from "../actions";
import type { Tables } from "@/types/supabase";

const roleColors: Record<string, string> = {
  CUSTOMER: "bg-blue-50 text-blue-700",
  COMPANY: "bg-green-50 text-green-700",
  ADMIN: "bg-purple-50 text-purple-700",
};

const roleLabels: Record<string, string> = {
  CUSTOMER: "고객",
  COMPANY: "조경회사",
  ADMIN: "관리자",
};

const roleFilters = [
  { value: "ALL", label: "전체" },
  { value: "CUSTOMER", label: "고객" },
  { value: "COMPANY", label: "조경회사" },
  { value: "ADMIN", label: "관리자" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Tables<"profiles">[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data ?? []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const result = await updateUserRole(userId, newRole);
    if (result?.success) {
      setUsers(
        users.map((u) =>
          u.id === userId
            ? { ...u, role: newRole as Tables<"profiles">["role"] }
            : u
        )
      );
    }
    setOpenMenuId(null);
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch =
      search === "" ||
      u.name?.includes(search) ||
      u.email?.includes(search);
    return matchRole && matchSearch;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
        <p className="text-gray-500 mt-1">등록된 회원을 관리하세요</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="이름 또는 이메일로 검색"
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {roleFilters.map((rf) => (
            <button
              key={rf.value}
              onClick={() => setRoleFilter(rf.value)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                roleFilter === rf.value
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {rf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        총 <span className="font-semibold text-gray-900">{filtered.length}</span>명의 회원
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-500">
                  회원
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  유형
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  가입일
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                          {user.name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`text-xs ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="relative inline-block" ref={openMenuId === user.id ? menuRef : undefined}>
                        <button
                          className="text-gray-400 hover:text-gray-600 p-1"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === user.id ? null : user.id
                            )
                          }
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                            {(["CUSTOMER", "COMPANY", "ADMIN"] as const)
                              .filter((r) => r !== user.role)
                              .map((r) => (
                                <button
                                  key={r}
                                  onClick={() => handleRoleChange(user.id, r)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {roleLabels[r]}으로 변경
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
