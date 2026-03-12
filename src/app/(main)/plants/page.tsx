"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Sprout, Sun, Droplets, Gauge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES: Record<string, string> = {
  ALL: "전체",
  TREE: "교목",
  SHRUB: "관목",
  FLOWER: "초화류",
  GRASS: "잔디",
  GROUND_COVER: "지피식물",
  CLIMBING: "덩굴식물",
  AQUATIC: "수생식물",
  INDOOR: "실내식물",
};

const SUNLIGHT: Record<string, string> = { FULL_SUN: "양지", PARTIAL_SUN: "반양지", SHADE: "음지" };
const WATERING: Record<string, string> = { FREQUENT: "많음", MODERATE: "보통", LOW: "적음" };
const DIFFICULTY: Record<string, string> = { EASY: "쉬움", MEDIUM: "보통", HARD: "어려움" };

const DIFFICULTY_COLOR: Record<string, string> = { EASY: "bg-green-100 text-green-700", MEDIUM: "bg-yellow-100 text-yellow-700", HARD: "bg-red-100 text-red-700" };

type Plant = {
  id: string;
  name: string;
  scientific_name: string | null;
  category: string;
  description: string;
  image_url: string | null;
  sunlight: string | null;
  watering: string | null;
  difficulty: string | null;
  tags: string[];
};

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase.from("plants").select("id, name, scientific_name, category, description, image_url, sunlight, watering, difficulty, tags").eq("is_published", true);
      if (category !== "ALL") query = query.eq("category", category);
      if (search) query = query.ilike("name", `%${search}%`);
      const { data } = await query.order("name");
      setPlants((data as Plant[] | null) ?? []);
      setLoading(false);
    };
    fetchPlants();
  }, [category, search]);

  const gradients = ["from-green-400 to-emerald-500", "from-lime-400 to-green-500", "from-teal-400 to-cyan-500", "from-emerald-400 to-teal-500"];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">식물 도감</h1>
            <p className="text-gray-500 mt-1">정원에 심을 식물을 찾아보세요</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="식물 이름 검색" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <button key={key} onClick={() => setCategory(key)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === key ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>
        ) : plants.length === 0 ? (
          <Card className="p-12 text-center">
            <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-lg">검색 결과가 없습니다</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plants.map((plant, i) => (
              <Link key={plant.id} href={`/plants/${plant.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className={`aspect-[4/3] bg-gradient-to-br ${gradients[i % gradients.length]} relative flex items-center justify-center`}>
                    {plant.image_url ? (
                      <img src={plant.image_url} alt={plant.name} className="w-full h-full object-cover" />
                    ) : (
                      <Sprout className="w-16 h-16 text-white/50" />
                    )}
                    {plant.difficulty && (
                      <Badge className={`absolute top-2 right-2 text-[10px] ${DIFFICULTY_COLOR[plant.difficulty] || ""}`}>{DIFFICULTY[plant.difficulty]}</Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{plant.name}</h3>
                    {plant.scientific_name && <p className="text-xs text-gray-400 italic mt-0.5">{plant.scientific_name}</p>}
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{plant.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      {plant.sunlight && <span className="flex items-center gap-0.5"><Sun className="w-3 h-3" /> {SUNLIGHT[plant.sunlight]}</span>}
                      {plant.watering && <span className="flex items-center gap-0.5"><Droplets className="w-3 h-3" /> {WATERING[plant.watering]}</span>}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
