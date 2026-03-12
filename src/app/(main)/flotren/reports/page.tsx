"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, FileText, Camera, Sprout, Sun, CloudRain, ThermometerSun, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

type ReportPhoto = { url: string; caption: string };
type PlantHealth = { overall: string; issues: string[] };

type Report = {
  id: string;
  title: string;
  summary: string;
  work_done: string[];
  plant_health: PlantHealth;
  photos: ReportPhoto[];
  recommendations: string;
  next_visit_notes: string;
  weather: string;
  status: string;
  created_at: string;
  visit: {
    scheduled_date: string;
    scheduled_time: string;
  } | null;
  manager_profile?: { name: string } | null;
};

const healthColors: Record<string, { label: string; color: string }> = {
  EXCELLENT: { label: "매우 좋음", color: "text-green-600" },
  GOOD: { label: "좋음", color: "text-green-500" },
  FAIR: { label: "보통", color: "text-yellow-600" },
  POOR: { label: "주의 필요", color: "text-orange-600" },
  CRITICAL: { label: "긴급", color: "text-red-600" },
};

function ReportsContent() {
  const searchParams = useSearchParams();
  const visitId = searchParams.get("visitId");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: subs } = await supabase
        .from("flotren_subscriptions")
        .select("id")
        .eq("customer_id", user.id);

      if (!subs?.length) { setLoading(false); return; }

      const subIds = subs.map(s => s.id);

      let query = (supabase as any)
        .from("flotren_reports")
        .select("*, flotren_visits(scheduled_date, scheduled_time)")
        .in("subscription_id", subIds)
        .eq("status", "PUBLISHED")
        .order("created_at", { ascending: false });

      if (visitId) {
        query = query.eq("visit_id", visitId);
      }

      const { data } = await query;

      const reportsWithManager: Report[] = [];
      for (const r of data || []) {
        let managerProfile = null;
        if (r.manager_id) {
          const { data: mp } = await supabase.from("profiles").select("name").eq("id", r.manager_id).single();
          managerProfile = mp;
        }
        reportsWithManager.push({
          ...r,
          work_done: (r.work_done as string[]) || [],
          plant_health: (r.plant_health as PlantHealth) || { overall: "GOOD", issues: [] },
          photos: (r.photos as ReportPhoto[]) || [],
          visit: r.flotren_visits as Report["visit"],
          manager_profile: managerProfile,
        });
      }

      setReports(reportsWithManager);
      if (reportsWithManager.length > 0) {
        setExpandedId(reportsWithManager[0].id);
      }
      setLoading(false);
    };
    fetchReports();
  }, [visitId]);

  if (loading) {
    return <div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/flotren/schedule"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">관리 리포트</h1>
            <p className="text-gray-500 text-sm mt-0.5">방문 후 작성된 정원 관리 보고서</p>
          </div>
        </div>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map(report => {
              const isExpanded = expandedId === report.id;
              const health = healthColors[report.plant_health.overall] || healthColors.GOOD;

              return (
                <Card key={report.id} className="overflow-hidden">
                  {/* Header - always visible */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                          {report.visit && (
                            <span>{new Date(report.visit.scheduled_date).toLocaleDateString("ko-KR")}</span>
                          )}
                          {report.manager_profile && <span>{report.manager_profile.name} 관리사</span>}
                          <span className={`font-medium ${health.color}`}>
                            <Sprout className="w-3.5 h-3.5 inline mr-0.5" />{health.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-6 border-t space-y-5">
                      {/* Summary */}
                      {report.summary && (
                        <div className="pt-4">
                          <p className="text-gray-700 leading-relaxed">{report.summary}</p>
                        </div>
                      )}

                      {/* Weather */}
                      {report.weather && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 rounded-lg px-3 py-2">
                          <ThermometerSun className="w-4 h-4 text-blue-500" />
                          날씨: {report.weather}
                        </div>
                      )}

                      {/* Work Done */}
                      {report.work_done.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">수행 작업</h4>
                          <div className="flex flex-wrap gap-2">
                            {report.work_done.map((work, i) => (
                              <Badge key={i} className="bg-green-50 text-green-700 text-xs font-normal">{work}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Plant Health */}
                      {report.plant_health.issues?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">식물 건강 이슈</h4>
                          <ul className="space-y-1">
                            {report.plant_health.issues.map((issue, i) => (
                              <li key={i} className="text-sm text-orange-600 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 shrink-0" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Photos */}
                      {report.photos.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                            <Camera className="w-4 h-4" /> 관리 사진
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {report.photos.map((photo, i) => (
                              <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                                <img src={photo.url} alt={photo.caption || ""} className="w-full h-full object-cover" />
                                {photo.caption && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
                                    {photo.caption}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {report.recommendations && (
                        <div className="bg-amber-50 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-amber-900 mb-1">관리사 권장사항</h4>
                          <p className="text-sm text-amber-800">{report.recommendations}</p>
                        </div>
                      )}

                      {/* Next Visit Notes */}
                      {report.next_visit_notes && (
                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">다음 방문 참고사항</h4>
                          <p className="text-sm text-blue-800">{report.next_visit_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 관리 리포트가 없습니다</h3>
            <p className="text-gray-500 text-sm">방문 완료 후 관리사가 작성한 리포트가 여기에 표시됩니다.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function FlotrenReportsPage() {
  return (
    <Suspense fallback={<div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>}>
      <ReportsContent />
    </Suspense>
  );
}
