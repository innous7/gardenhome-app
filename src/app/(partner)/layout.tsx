"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, LayoutDashboard, FolderOpen, FileText, Star, BarChart3, Settings, LogOut, Hammer } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";

const sidebarItems = [
  { label: "대시보드", href: "/partner/dashboard", icon: LayoutDashboard },
  { label: "포트폴리오", href: "/partner/portfolio", icon: FolderOpen },
  { label: "견적 관리", href: "/partner/quotes", icon: FileText },
  { label: "프로젝트", href: "/partner/projects", icon: Hammer },
  { label: "리뷰 관리", href: "/partner/reviews", icon: Star },
  { label: "통계", href: "/partner/stats", icon: BarChart3 },
  { label: "설정", href: "/partner/settings", icon: Settings },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">GardenHome</span>
              <span className="text-xs text-green-600 block -mt-0.5">파트너</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors">
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold">파트너</span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto">
          {sidebarItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "p-2 rounded-lg",
                pathname === item.href ? "bg-green-50 text-green-700" : "text-gray-500"
              )}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
