"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Sun, Droplets, Gauge, TrendingUp, MapPin, Calendar, Sprout, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

const CATEGORIES: Record<string, string> = { TREE: "교목", SHRUB: "관목", FLOWER: "초화류", GRASS: "잔디", GROUND_COVER: "지피식물", CLIMBING: "덩굴식물", AQUATIC: "수생식물", INDOOR: "실내식물" };
const SUNLIGHT: Record<string, string> = { FULL_SUN: "양지 (직사광선)", PARTIAL_SUN: "반양지 (간접광)", SHADE: "음지" };
const WATERING: Record<string, string> = { FREQUENT: "물주기 많이 (주 2-3회)", MODERATE: "보통 (주 1회)", LOW: "적게 (2주 1회)" };
const DIFFICULTY: Record<string, string> = { EASY: "초보자 추천", MEDIUM: "중급", HARD: "상급자" };
const GROWTH: Record<string, string> = { FAST: "빠름", MEDIUM: "보통", SLOW: "느림" };

type PlantDetail = {
  id: string; name: string; scientific_name: string | null; category: string; description: string;
  image_url: string | null; images: string[]; sunlight: string | null; watering: string | null;
  difficulty: string | null; growth_rate: string | null; climate_zones: string[];
  flowering_season: string[]; height_min: number | null; height_max: number | null;
  tags: string[]; care_tips: string; planting_tips: string; pruning_tips: string; view_count: number;
};

type Tip = { id: string; content: string; author_id: string; created_at: string; profiles: { name: string } | null };

export default function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { requireAuth } = useAuth();
  const [plant, setPlant] = useState<PlantDetail | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [newTip, setNewTip] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);

    const { data } = await supabase.from("plants").select("*").eq("id", id).single();
    setPlant(data as PlantDetail | null);
    if (data) {
      await supabase.from("plants").update({ view_count: data.view_count + 1 }).eq("id", id);
    }

    const { data: tipsData } = await supabase
      .from("plant_tips")
      .select("*, profiles!plant_tips_author_id_fkey(name)")
      .eq("plant_id", id)
      .order("created_at", { ascending: false });
    setTips((tipsData as Tip[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAddTip = async () => {
    if (!newTip.trim()) return;
    if (!requireAuth("팁을 작성하려면 로그인이 필요합니다.")) return;
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("plant_tips").insert({ plant_id: id, author_id: userId, content: newTip.trim() });
    setNewTip("");
    fetchData();
  };

  const handleDeleteTip = async (tipId: string) => {
    const supabase = createClient();
    await supabase.from("plant_tips").delete().eq("id", tipId);
    fetchData();
  };

  if (loading) return <div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  if (!plant) return <div className="pt-20 text-center py-20 text-gray-400">식물을 찾을 수 없습니다.</div>;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/plants"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <Badge variant="secondary">{CATEGORIES[plant.category]}</Badge>
        </div>

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="aspect-square bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl overflow-hidden flex items-center justify-center">
            {plant.image_url ? <img src={plant.image_url} alt={plant.name} className="w-full h-full object-cover" /> : <Sprout className="w-24 h-24 text-white/40" />}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{plant.name}</h1>
            {plant.scientific_name && <p className="text-gray-400 italic mt-1">{plant.scientific_name}</p>}
            <p className="text-gray-600 mt-4 leading-relaxed">{plant.description}</p>
            {(plant.tags as string[])?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {(plant.tags as string[]).map(tag => <span key={tag} className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">#{tag}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {plant.sunlight && (
            <Card className="p-4 text-center"><Sun className="w-5 h-5 text-yellow-500 mx-auto mb-2" /><p className="text-xs text-gray-500">일조량</p><p className="text-sm font-medium mt-0.5">{SUNLIGHT[plant.sunlight]?.split(" ")[0]}</p></Card>
          )}
          {plant.watering && (
            <Card className="p-4 text-center"><Droplets className="w-5 h-5 text-blue-500 mx-auto mb-2" /><p className="text-xs text-gray-500">물주기</p><p className="text-sm font-medium mt-0.5">{WATERING[plant.watering]?.split(" ")[0]}</p></Card>
          )}
          {plant.difficulty && (
            <Card className="p-4 text-center"><Gauge className="w-5 h-5 text-green-500 mx-auto mb-2" /><p className="text-xs text-gray-500">난이도</p><p className="text-sm font-medium mt-0.5">{DIFFICULTY[plant.difficulty]}</p></Card>
          )}
          {plant.growth_rate && (
            <Card className="p-4 text-center"><TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-2" /><p className="text-xs text-gray-500">성장속도</p><p className="text-sm font-medium mt-0.5">{GROWTH[plant.growth_rate]}</p></Card>
          )}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {(plant.climate_zones as string[])?.length > 0 && (
            <Card className="p-5"><div className="flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-gray-500" /><h3 className="font-medium text-gray-900">적합 기후대</h3></div><div className="flex flex-wrap gap-2">{(plant.climate_zones as string[]).map(z => <Badge key={z} variant="secondary">{z}</Badge>)}</div></Card>
          )}
          {(plant.flowering_season as string[])?.length > 0 && (
            <Card className="p-5"><div className="flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-gray-500" /><h3 className="font-medium text-gray-900">개화 시기</h3></div><div className="flex flex-wrap gap-2">{(plant.flowering_season as string[]).map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div></Card>
          )}
          {(plant.height_min || plant.height_max) && (
            <Card className="p-5"><div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-gray-500" /><h3 className="font-medium text-gray-900">성장 높이</h3></div><p className="text-sm text-gray-600">{plant.height_min}m ~ {plant.height_max}m</p></Card>
          )}
        </div>

        {/* Care Guide */}
        <div className="space-y-4 mb-8">
          {plant.care_tips && (
            <Card className="p-6"><h3 className="font-semibold text-gray-900 mb-3">관리 방법</h3><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{plant.care_tips}</p></Card>
          )}
          {plant.planting_tips && (
            <Card className="p-6"><h3 className="font-semibold text-gray-900 mb-3">식재 팁</h3><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{plant.planting_tips}</p></Card>
          )}
          {plant.pruning_tips && (
            <Card className="p-6"><h3 className="font-semibold text-gray-900 mb-3">전정 가이드</h3><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{plant.pruning_tips}</p></Card>
          )}
        </div>

        {/* User Tips */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">사용자 후기/팁 ({tips.length})</h3>
          <div className="flex gap-2 mb-4">
            <Input placeholder="키워본 경험이나 팁을 공유해주세요" value={newTip} onChange={e => setNewTip(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddTip()} className="h-10 rounded-xl flex-1" />
            <Button onClick={handleAddTip} disabled={!newTip.trim()} className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-4"><Send className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-3">
            {tips.map(tip => (
              <div key={tip.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-[10px] font-bold text-green-600 shrink-0 mt-0.5">{tip.profiles?.name?.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-900">{tip.profiles?.name}</span><span className="text-[10px] text-gray-400">{new Date(tip.created_at).toLocaleDateString("ko-KR")}</span></div>
                    <p className="text-sm text-gray-600 mt-0.5">{tip.content}</p>
                  </div>
                </div>
                {userId === tip.author_id && <button onClick={() => handleDeleteTip(tip.id)} className="text-gray-400 hover:text-red-500 p-1 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
            {tips.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">아직 후기가 없습니다. 첫 번째 팁을 남겨보세요!</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
