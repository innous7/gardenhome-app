export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Ruler,
  Banknote,
  Eye,
  Heart,
  Star,
  Building2,
  Leaf,
  Hammer,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrapButton } from "@/components/ui/scrap-button";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { AuthLink } from "@/components/auth/AuthLink";
import { getPortfolioById, getPortfolios } from "@/lib/supabase/queries";
import { getUserScraps } from "@/app/(main)/explore/actions";
import { PROJECT_TYPES, GARDEN_STYLES } from "@/lib/constants";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const portfolio = await getPortfolioById(id);
  if (!portfolio) return { title: "Not Found" };
  return {
    title: `${portfolio.title} | GardenHome 포트폴리오`,
    description: portfolio.excerpt,
    openGraph: {
      title: portfolio.title,
      description: portfolio.excerpt,
      type: "article",
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const portfolio = await getPortfolioById(id);
  if (!portfolio) notFound();

  const [relatedPortfoliosAll, userScraps] = await Promise.all([
    getPortfolios(),
    getUserScraps(),
  ]);
  const relatedPortfolios = relatedPortfoliosAll
    .filter((p) => p.id !== id && p.style === portfolio.style)
    .slice(0, 3);
  const isScrapped = userScraps.includes(id);

  const company = portfolio.companies as {
    id: string;
    company_name: string;
    logo_url: string | null;
    rating: number;
    review_count: number;
  } | null;

  const beforeImages = (portfolio.before_images as string[] | null) ?? [];
  const afterImages = (portfolio.after_images as string[] | null) ?? [];
  const plants = (portfolio.plants as string[] | null) ?? [];
  const materials = (portfolio.materials as string[] | null) ?? [];

  const infoItems = [
    { icon: Ruler, label: "면적", value: portfolio.area ? `${portfolio.area}㎡` : null },
    { icon: Clock, label: "기간", value: portfolio.duration },
    { icon: MapPin, label: "위치", value: portfolio.location },
    { icon: Banknote, label: "예산", value: portfolio.budget },
  ].filter((item) => item.value);

  const gradients = [
    "from-green-400 to-emerald-600",
    "from-teal-400 to-green-600",
    "from-emerald-400 to-cyan-600",
  ];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Cover Image / Hero */}
      <div className="bg-gradient-to-br from-green-400 to-emerald-600 h-64 sm:h-80 lg:h-96 relative">
        {portfolio.cover_image_url ? (
          <img
            src={portfolio.cover_image_url}
            alt={portfolio.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/10 text-[120px] font-bold">
              {portfolio.style.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 h-full flex flex-col justify-end pb-8">
          <div className="flex gap-2 mb-4">
            <Badge className="bg-white/90 text-gray-700 text-xs">
              {PROJECT_TYPES[portfolio.project_type] ?? portfolio.project_type}
            </Badge>
            <Badge className="bg-green-600/90 text-white text-xs">
              {GARDEN_STYLES[portfolio.style] ?? portfolio.style}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">
            {portfolio.title}
          </h1>
          <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {portfolio.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" /> {portfolio.likes}
            </span>
            {portfolio.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {portfolio.location}
              </span>
            )}
            <ScrapButton portfolioId={id} initialScrapped={isScrapped} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back button */}
        <Link href="/explore">
          <Button variant="ghost" size="sm" className="text-gray-500 mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> 탐색으로 돌아가기
          </Button>
        </Link>

        {/* Info card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-gray-600 leading-relaxed text-lg">
            {portfolio.excerpt}
          </p>

          {infoItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Before / After images */}
        {beforeImages.length > 0 && afterImages.length > 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Before / After</h2>
            <div className="space-y-6">
              {beforeImages.map((beforeImg: string, i: number) => {
                const afterImg = afterImages[i];
                if (!afterImg) return null;
                return (
                  <BeforeAfterSlider
                    key={i}
                    beforeImage={beforeImg}
                    afterImage={afterImg}
                    beforeLabel="시공 전"
                    afterLabel="시공 후"
                  />
                );
              })}
            </div>
          </div>
        ) : (beforeImages.length > 0 || afterImages.length > 0) ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            {beforeImages.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  시공 전
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {beforeImages.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"
                    >
                      <img
                        src={img}
                        alt={`시공 전 ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {afterImages.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  시공 후
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {afterImages.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"
                    >
                      <img
                        src={img}
                        alt={`시공 후 ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Plants & Materials */}
        {(plants.length > 0 || materials.length > 0) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            {plants.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-1 mb-3">
                  <Leaf className="w-4 h-4 text-green-500" /> 사용 식물
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plants.map((plant) => (
                    <Badge
                      key={plant}
                      variant="secondary"
                      className="bg-green-50 text-green-700 text-xs"
                    >
                      {plant}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {materials.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-1 mb-3">
                  <Hammer className="w-4 h-4 text-amber-500" /> 사용 자재
                </h3>
                <div className="flex flex-wrap gap-2">
                  {materials.map((material) => (
                    <Badge
                      key={material}
                      variant="secondary"
                      className="bg-amber-50 text-amber-700 text-xs"
                    >
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Company card */}
        {company && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">
              시공 업체
            </h3>
            <Link href={`/companies/${company.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center overflow-hidden">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {company.company_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {company.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({company.review_count}개 리뷰)
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-green-600 border-green-200 hover:bg-green-50"
              >
                업체 보기
              </Button>
            </Link>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <AuthLink href={`/chat?company=${company.id}`} message="문의하려면 로그인이 필요합니다." className="flex-1">
                <Button variant="outline" className="w-full rounded-xl text-sm">
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  문의하기
                </Button>
              </AuthLink>
              <AuthLink href="/quote" message="견적을 요청하려면 로그인이 필요합니다." className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">
                  견적 요청
                </Button>
              </AuthLink>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-green-50 rounded-2xl p-8 text-center mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            이런 정원을 원하시나요?
          </h3>
          <p className="text-gray-500 mb-4">
            검증된 조경 전문가에게 무료 견적을 받아보세요.
          </p>
          <AuthLink href="/quote" message="견적을 요청하려면 로그인이 필요합니다.">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8">
              무료 견적 받기
            </Button>
          </AuthLink>
        </div>

        {/* Related Portfolios */}
        {relatedPortfolios.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              비슷한 포트폴리오
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPortfolios.map((rp, i) => (
                <Link
                  key={rp.id}
                  href={`/explore/${rp.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div
                      className={`aspect-[4/3] bg-gradient-to-br ${gradients[i % gradients.length]} relative`}
                    >
                      {rp.cover_image_url ? (
                        <img
                          src={rp.cover_image_url}
                          alt={rp.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white/20 text-5xl font-bold">
                            {rp.style.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                        {rp.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {rp.excerpt}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        {rp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {rp.location}
                          </span>
                        )}
                        <span>
                          {GARDEN_STYLES[rp.style] ?? rp.style}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
