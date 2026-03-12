import Link from "next/link";
import {
  Trees,
  Building,
  Flower,
  Store,
  FileText,
  Building2,
  BookOpen,
  Sprout,
} from "lucide-react";

const categories = [
  { icon: Trees, label: "정원 조경", href: "/explore?type=GARDEN" },
  { icon: Building, label: "옥상 조경", href: "/explore?type=ROOFTOP" },
  { icon: Flower, label: "베란다", href: "/explore?type=VERANDA" },
  { icon: Store, label: "상업시설", href: "/explore?type=COMMERCIAL" },
  { icon: FileText, label: "무료 견적", href: "/quote" },
  { icon: Building2, label: "조경회사", href: "/companies" },
  { icon: BookOpen, label: "블로그", href: "/blog" },
  { icon: Sprout, label: "조경관리", href: "/flotren" },
];

export default function StatsSection() {
  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          어떤 조경을 찾으세요?
        </h2>
        <div className="grid grid-cols-4 lg:grid-cols-5 gap-2">
          {categories.map((category) => (
            <Link
              key={category.label}
              href={category.href}
              className="flex flex-col items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-50 rounded-full flex items-center justify-center">
                <category.icon className="w-5 h-5 lg:w-7 lg:h-7 text-green-600" />
              </div>
              <span className="text-xs lg:text-sm text-gray-700 text-center mt-2 font-medium">
                {category.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
