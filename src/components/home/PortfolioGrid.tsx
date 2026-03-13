"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GARDEN_STYLES } from "@/lib/constants";
import type { Tables } from "@/types/supabase";

type PortfolioWithCompany = Tables<"portfolios"> & {
  companies: { id: string; company_name: string } | null;
};

function PortfolioCard({ portfolio }: { portfolio: PortfolioWithCompany }) {
  const gradients = [
    "from-green-400 to-emerald-600",
    "from-teal-400 to-green-600",
    "from-emerald-400 to-cyan-600",
    "from-lime-400 to-green-600",
    "from-green-500 to-teal-600",
    "from-emerald-500 to-green-700",
  ];
  const gradientIndex =
    parseInt(portfolio.id.replace(/\D/g, "")) % gradients.length;

  return (
    <Link href={`/explore/${portfolio.id}`} className="group">
      {/* Image area */}
      <div className="aspect-[4/3] rounded-xl overflow-hidden">
        <div
          className={`w-full h-full bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative`}
        >
          {portfolio.cover_image_url ? (
            <img src={portfolio.cover_image_url} alt={portfolio.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="text-white/30 text-6xl font-bold">
              {GARDEN_STYLES[portfolio.style]?.charAt(0) ?? portfolio.style.charAt(0)}
            </span>
          )}
        </div>
      </div>
      {/* Info */}
      <div className="pt-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
          {portfolio.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {portfolio.companies?.company_name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {portfolio.location} · {portfolio.area}평
        </p>
      </div>
    </Link>
  );
}

export default function PortfolioGrid() {
  const [portfolios, setPortfolios] = useState<PortfolioWithCompany[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("portfolios")
      .select("*, companies(id, company_name)")
      .eq("is_published", true)
      .order("views", { ascending: false })
      .limit(6)
      .then(({ data }) => setPortfolios(data ?? []));
  }, []);

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">인기 시공사례</h2>
          <Link
            href="/explore"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            더보기 &gt;
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      </div>
    </section>
  );
}
