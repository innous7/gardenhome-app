import Link from "next/link";
import { getCompanies } from "@/lib/supabase/queries";

export default async function CompanyShowcase() {
  const allCompanies = await getCompanies();
  const companies = allCompanies.slice(0, 4);

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">인기 조경회사</h2>
          <Link
            href="/companies"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            더보기 &gt;
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="group"
            >
              <div className="bg-white rounded-xl p-5 hover:shadow-md transition-shadow duration-300">
                {/* Circle avatar */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">
                      {company.company_name.charAt(0)}
                    </span>
                  </div>
                </div>
                {/* Name */}
                <h3 className="text-sm font-bold text-gray-900 text-center mt-3 group-hover:text-green-600 transition-colors">
                  {company.company_name}
                </h3>
                {/* Rating */}
                <p className="text-xs text-gray-500 text-center mt-1">
                  ★ {company.rating} · 리뷰 {company.review_count}
                </p>
                {/* Address */}
                <p className="text-xs text-gray-400 text-center mt-1 line-clamp-1">
                  {company.address}
                </p>
                {/* Specialties */}
                <div className="flex gap-1 justify-center flex-wrap mt-3">
                  {(company.specialties as string[]).slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
