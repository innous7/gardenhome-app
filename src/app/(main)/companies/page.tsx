"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Star, MapPin, CheckCircle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";

const areas = ["전체", "서울", "경기", "인천", "충남", "제주"];

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("전체");
  const [companies, setCompanies] = useState<Tables<"companies">[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("companies")
      .select("*")
      .eq("is_approved", true)
      .order("rating", { ascending: false })
      .then(({ data }) => setCompanies(data ?? []));
  }, []);

  const filtered = companies.filter((c) => {
    const matchSearch = c.company_name.includes(search) || (c.specialties as string[]).some(s => s.includes(search));
    const matchArea = selectedArea === "전체" || (c.service_areas as string[]).includes(selectedArea);
    return matchSearch && matchArea;
  });

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">조경회사 찾기</h1>
          <p className="text-gray-500 mt-2">검증된 전문 조경회사를 찾아보세요</p>

          {/* Search */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="회사명 또는 전문 분야로 검색"
                className="pl-10 h-12 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Area filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedArea === area
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Company Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-500 mb-6">{filtered.length}개의 조경회사</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((company, i) => {
            const gradients = [
              "from-green-400 to-emerald-500",
              "from-teal-400 to-cyan-500",
              "from-emerald-400 to-green-500",
              "from-lime-400 to-green-500",
            ];
            return (
              <Link key={company.id} href={`/companies/${company.id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <div className={`h-32 bg-gradient-to-br ${gradients[i % gradients.length]} relative`}>
                    <div className="absolute -bottom-8 left-6">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl font-bold text-green-600 border-2 border-white overflow-hidden">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.company_name} className="w-full h-full object-cover" />
                        ) : (
                          company.company_name.charAt(0)
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-10 pb-6 px-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        {company.company_name}
                      </h3>
                      {company.is_verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{company.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-yellow-400" />
                        <span className="font-semibold text-gray-700">{company.rating}</span>
                      </span>
                      <span className="text-gray-400">리뷰 {company.review_count}</span>
                      <span className="text-gray-400">시공 {company.project_count}건</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {(company.service_areas as string[]).join(", ")}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(company.specialties as string[]).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs font-normal">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            조건에 맞는 조경회사가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
