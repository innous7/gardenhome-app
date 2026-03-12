import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, CheckCircle, MessageCircle, PenSquare, Clock, Award, ArrowRight, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCompanyById, getPortfoliosByCompany, getReviewsByCompany } from "@/lib/supabase/queries";
import { PROJECT_TYPES, GARDEN_STYLES } from "@/lib/constants";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) notFound();

  const portfolios = await getPortfoliosByCompany(id);
  const reviews = await getReviewsByCompany(id);
  const avgRating = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  const gradients = [
    "from-green-400 to-emerald-600",
    "from-teal-400 to-green-600",
    "from-emerald-400 to-cyan-600",
    "from-lime-400 to-green-600",
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Cover */}
      <div className={`h-48 sm:h-64 bg-gradient-to-br from-green-500 to-emerald-700 relative`}>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Company Info */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-green-600 shrink-0 border-4 border-white shadow-md -mt-16 sm:-mt-12">
              {company.company_name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{company.company_name}</h1>
                {company.is_verified && (
                  <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                    <CheckCircle className="w-3 h-3 mr-1" /> 인증업체
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 mt-2">{company.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-gray-700">{company.rating}</span>
                  <span>({company.review_count})</span>
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-green-500" />
                  시공 {company.project_count}건
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {company.address}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {company.established}년 설립
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {(company.specialties as string[]).map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end shrink-0">
              <Link href="/quote">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 w-full sm:w-auto">
                  견적 요청하기
                </Button>
              </Link>
              <Link href={`/chat?company=${id}`}>
                <Button variant="outline" className="rounded-full px-6 w-full sm:w-auto">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  채팅하기
                </Button>
              </Link>
              <Link href={`/reviews/write?company=${id}`}>
                <Button variant="outline" className="rounded-full px-6 w-full sm:w-auto">
                  <PenSquare className="w-4 h-4 mr-2" />
                  리뷰 작성
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="bg-white border rounded-xl p-1 h-auto">
            <TabsTrigger value="portfolio" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              포트폴리오 ({portfolios.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              리뷰 ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="info" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              회사 정보
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {portfolios.map((p, i) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className={`aspect-[16/10] bg-gradient-to-br ${gradients[i % gradients.length]} relative`}>
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-white/90 text-gray-700 text-xs">{PROJECT_TYPES[p.project_type]}</Badge>
                      <Badge className="bg-green-600/90 text-white text-xs">{GARDEN_STYLES[p.style]}</Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 flex gap-2 text-white text-xs">
                      <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                        <Eye className="w-3 h-3" /> {p.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                        <Heart className="w-3 h-3" /> {p.likes}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{p.excerpt}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                      <span>{p.location}</span>
                      <span>{p.area}㎡</span>
                      <span>{p.duration}</span>
                      <span>{p.budget}</span>
                    </div>
                  </div>
                </div>
              ))}
              {portfolios.length === 0 && (
                <div className="col-span-2 text-center py-20 text-gray-400">
                  아직 등록된 포트폴리오가 없습니다.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                        {review.profiles?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{review.profiles?.name}</p>
                        <p className="text-xs text-gray-400">{review.created_at}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600 text-sm leading-relaxed">{review.content}</p>
                  <div className="flex gap-4 mt-4 text-xs text-gray-400">
                    <span>디자인 {review.design_rating}/5</span>
                    <span>시공품질 {review.quality_rating}/5</span>
                    <span>소통 {review.communication_rating}/5</span>
                    <span>일정 {review.schedule_rating}/5</span>
                    <span>가성비 {review.value_rating}/5</span>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  아직 등록된 리뷰가 없습니다.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">기본 정보</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">대표자</dt>
                      <dd className="text-gray-900 font-medium">{company.representative}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">사업자번호</dt>
                      <dd className="text-gray-900 font-medium">{company.business_number}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">설립연도</dt>
                      <dd className="text-gray-900 font-medium">{company.established}년</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">연락처</dt>
                      <dd className="text-gray-900 font-medium">{company.phone}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">주소</dt>
                      <dd className="text-gray-900 font-medium">{company.address}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">서비스 지역</h4>
                  <div className="flex flex-wrap gap-2">
                    {(company.service_areas as string[]).map((area) => (
                      <Badge key={area} variant="secondary" className="text-sm">{area}</Badge>
                    ))}
                  </div>
                  <h4 className="font-semibold text-gray-900 mt-6 mb-4">전문 분야</h4>
                  <div className="flex flex-wrap gap-2">
                    {(company.specialties as string[]).map((s) => (
                      <Badge key={s} className="bg-green-50 text-green-700 hover:bg-green-50 text-sm">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
